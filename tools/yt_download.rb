#!/usr/bin/env ruby

require 'nokogiri'
require 'json'

def download_file(url, dest)
  system "python yt_download.py #{url} #{dest}"
  nil
end

def process_file(module_html, yt_videos_path)
    array = module_html.split('/')

    doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

    doc.css('h1').each do |h1|
      href = h1.parent.parent.last_element_child['href']
      sub_module_title = h1.text
      sub_module_title.strip!
      puts "Processing #{sub_module_title} #{href} ..."
      download_file(href, yt_videos_path)
    end
 
  nil
end

def main
    module_html = ARGV[0]
    yt_videos_path = ARGV[1] || './yt_videos'

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
