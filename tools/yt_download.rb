#!/usr/bin/env ruby

require 'nokogiri'
require 'json'

def download_file(url, dest)
  system "python yt_download.py #{url} #{dest}"
  nil
end

def process_file(module_html, yt_videos_path, start_index)
    doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

    i = 0
    doc.css('h1').each do |h1|
      i = i + 1
      if i > start_index
        href = h1.parent.parent.last_element_child['href']
        sub_module_title = h1.text
        sub_module_title.strip!
        puts "Processing #{sub_module_title} #{href} ..."
        dest = "'#{yt_videos_path}/#{sub_module_title}-720p.mp4'"
        download_file(href, dest)
      end
    end
 
  nil
end

def main
    module_html = ARGV[0]
    start_index = ARGV[1] || '0'
    start_index = start_index.to_i
    yt_videos_path = ARGV[2] || './yt_videos'

    process_file(module_html, yt_videos_path, start_index)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} module_html (optional) start_index (optional) yt_videos_path

  EOU

  abort usage if ARGV.length < 1

  main

end
#./create_module.rb ../docs/dzfs/04.html nCCAkgxyN6 8
