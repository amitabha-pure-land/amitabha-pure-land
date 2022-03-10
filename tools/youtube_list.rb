#!/usr/bin/ruby

require 'rubygems'
gem 'google-api-client', '>0.7'
require 'google/apis'
require 'google/apis/youtube_v3'
require 'googleauth'
require 'googleauth/stores/file_token_store'

require 'fileutils'
require 'json'
require 'csv'
require 'open3'

# REPLACE WITH VALID REDIRECT_URI FOR YOUR CLIENT
REDIRECT_URI = 'http://localhost:4567'
APPLICATION_NAME = 'YouTube Data API Ruby Tests'

# REPLACE WITH NAME/LOCATION OF YOUR client_secrets.json FILE
CLIENT_SECRETS_PATH = 'client_secret.json'

# REPLACE FINAL ARGUMENT WITH FILE WHERE CREDENTIALS WILL BE STORED
CREDENTIALS_PATH = File.join(Dir.home, '.credentials', "youtube-quickstart-ruby-credentials.yaml")

# SCOPE FOR WHICH THIS SCRIPT REQUESTS AUTHORIZATION
SCOPE = Google::Apis::YoutubeV3::AUTH_YOUTUBE_READONLY

def authorize
  FileUtils.mkdir_p(File.dirname(CREDENTIALS_PATH))

  client_id = Google::Auth::ClientId.from_file(CLIENT_SECRETS_PATH)
  token_store = Google::Auth::Stores::FileTokenStore.new(file: CREDENTIALS_PATH)
  authorizer = Google::Auth::UserAuthorizer.new(client_id, SCOPE, token_store)
  user_id = 'default'
  credentials = authorizer.get_credentials(user_id)
  if credentials.nil?
    url = authorizer.get_authorization_url(base_url: REDIRECT_URI)
    puts "Open the following URL in the browser and enter the " +
         "resulting code after authorization"
    puts url
    
    code = 'pending'
    command = 'ruby yt_oauth.rb'
    puts command
    unprocessed_output = ""
    Open3.popen3(command) {|stdin, stdout, stderr, wait_thr|

      on_newline = ->(new_line) do
          puts "process said: #{new_line}"
          unless new_line.start_with?('== Sinatra') || new_line.include?("INFO")
            code = new_line.chomp
            stdin.close
            stdout.close
            stderr.close
          end 
      end
  
      Thread.new do
          while not stderr.closed? # FYI this check is probably close to useless/bad
              unprocessed_output += stderr.readpartial(4096)
              if unprocessed_output =~ /(.+)\n/
                  # extract the line
                  new_line = $1
                  # remove the line from unprocessed_output
                  unprocessed_output.sub!(/(.+)\n/,"")
                  # run the on_newline
                  on_newline[new_line]
              end
  
              # in theres no newline, this process will hang forever
              # (e.g. probably want to add a timeout)
          end
      end
  
      wait_thr.join
    }
    
    puts "code: #{code}"
    credentials = authorizer.get_and_store_credentials_from_code(
      user_id: user_id, code: code, base_url: REDIRECT_URI)
  end
  credentials
end

def youtube_playlist_to_csv(playlist_id, csv_file_dir)
  begin
    # Initialize the API
    service = Google::Apis::YoutubeV3::YouTubeService.new
    service.client_options.application_name = APPLICATION_NAME
    service.authorization = authorize

    result = service.list_playlists('snippet', id: playlist_id)
  rescue => exception
    puts exception
    puts "deleting: #{CREDENTIALS_PATH}"
    FileUtils.remove_file(CREDENTIALS_PATH)
    retry
  end

  filename = "#{csv_file_dir}/#{result.items[0].snippet.title}.csv"

  i = 0
  array = []
  nextPageToken = nil
  loop do
    result = service.list_playlist_items('snippet', playlist_id: playlist_id, max_results: 1000, page_token: nextPageToken)
    result.items.each do |v|
      i += 1
      url = "https://youtu.be/#{v.snippet.resource_id.video_id}"
      puts "#{i} - #{url}"
      array << [v.snippet.published_at, url, v.snippet.channel_title, v.snippet.title, playlist_id]
    end
    nextPageToken = result.next_page_token
    break if !nextPageToken
  end
  
  # array = array.sort_by { |e| e[3] }

  puts "writng to file: #{filename}"
  CSV.open(filename, "w") do |csv|
    csv << ['Published Date', 'Video URL', 'Channel', 'Title', 'Description']
    array.each do |e|
      csv << e
    end
  end

end

def main
  playlist_id = ARGV[0] 
  csv_file_dir = ARGV[1] || '.'
  FileUtils.remove_file(CREDENTIALS_PATH) if ARGV[2]

  youtube_playlist_to_csv(playlist_id, csv_file_dir)
end


if __FILE__ == $0
usage = <<-EOU

usage: ruby #{File.basename($0)} playlist_id csv_file_dir (optional)force_auth

EOU

abort usage if ARGV.length < 1

main

end
