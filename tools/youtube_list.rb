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

# REPLACE WITH VALID REDIRECT_URI FOR YOUR CLIENT
REDIRECT_URI = 'http://localhost'
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
  authorizer = Google::Auth::UserAuthorizer.new(
    client_id, SCOPE, token_store)
  user_id = 'default'
  credentials = authorizer.get_credentials(user_id)
  if credentials.nil?
    url = authorizer.get_authorization_url(base_url: REDIRECT_URI)
    puts "Open the following URL in the browser and enter the " +
         "resulting code after authorization"
    puts url
    code = STDIN.gets.chomp
    credentials = authorizer.get_and_store_credentials_from_code(
      user_id: user_id, code: code, base_url: REDIRECT_URI)
  end
  credentials
end

def youtube_playlist_to_csv(playlist_id, csv_file_dir)
  # Initialize the API
  service = Google::Apis::YoutubeV3::YouTubeService.new
  service.client_options.application_name = APPLICATION_NAME
  service.authorization = authorize

  result = service.list_playlists('snippet', id: playlist_id)
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
  
  array = array.sort_by { |e| e[3] }

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

  youtube_playlist_to_csv(playlist_id, csv_file_dir)
end


if __FILE__ == $0
usage = <<-EOU

usage: ruby #{File.basename($0)} playlist_id csv_file_dir

EOU

abort usage if ARGV.length < 1

main

end
