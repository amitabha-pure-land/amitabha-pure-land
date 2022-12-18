#!/usr/bin/env ruby

require 'nokogiri'
require 'parse/stack'
require 'json'

def call_parse_function(name, params)
  result = Parse.call_function name, params, raw: true
  # puts result
  json = JSON.parse(result.to_s)
  json['result']
end

def download_file(url, dest)
  # FileUtils.touch(dest)
  open(url) do |u|
    File.open(dest, 'wb') { |f| f.write(u.read) }
  end
end

def process_file(module_html, yt_videos_path)
    array = module_html.split('/')

    doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

    doc.css('h1').each do |h1|
      href = h1.parent.parent.last_element_child['href']
      sub_module_title = h1.text
      sub_module_title.strip!
      puts "Processing #{sub_module_title} #{href} ..."

      array = href.split('/')
      youtubeId = array[array.length - 1]

      params = {youtubeId: youtubeId}
      result = call_parse_function 'video:loadYoutubeInfo', params
      formats = result['formats']
      # puts formats

      maxFormat = nil
      for format in formats do
        if format['height'] && (!maxFormat || format['height'] > maxFormat['height'])
          maxFormat = format
        end
      end
      # puts maxFormat
  
      url = maxFormat['url']
      dest = "#{yt_videos_path}/#{sub_module_title}-#{maxFormat['format'].split('(')[1].split(')')[0]}.mp4"
      if !File.file?(dest)
        puts "Dowloading: #{url} to #{dest} ..."
        download_file(url, dest)
      end

      break
    end
 
  nil
end

def main
    module_html = ARGV[0]
    yt_videos_path = ARGV[1] || './yt_videos'
    app_id = ARGV[2] || "NRXUJ7VoDl3pho3QihRUnN6JoRdAOPiLnV5A0vifIwE"
    master_key = ARGV[3] || "wVuwX7XYH0E2X9fmMXoxyigZI3eEzJDnAGG3B8AI4lA"    
    server_url = ARGV[4] || ENV["SERVER_URL"] || 'http://localhost:1337/parse'

    Parse.setup app_id: app_id, master_key: master_key, server_url: server_url
             
    process_file(module_html, yt_videos_path)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} module_html (optional) yt_videos_path app_id master_key server_url

  EOU

  abort usage if ARGV.length < 1

  main

end
#./create_module.rb ../docs/dzfs/04.html nCCAkgxyN6 8
