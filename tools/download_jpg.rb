#!/usr/bin/env ruby

require 'nokogiri'
require 'fileutils'
require 'open-uri'

def download_image(url, dest)
  # FileUtils.touch(dest)
  open(url) do |u|
    File.open(dest, 'wb') { |f| f.write(u.read) }
  end
end

def process_file(module_html, output_dir)
  puts "Creating dir #{output_dir} ..."
  FileUtils.mkdir_p(output_dir)

  doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

  i = 0
  doc.css('img').each do |img|
    url = img['src']
    suffix = '_s.jpg'
    if (url.end_with?(suffix))
      url = url.gsub(suffix, '.jpg')
      index = img.parent.parent.parent.parent.parent.last_element_child.last_element_child.text
      dest = "#{output_dir}/#{index}.jpg"
      if File.file?(dest)
        dest = "#{output_dir}/#{index}_#{url.split('/').last}.jpg"
      end
      puts "Dowloading: #{url} to #{dest} ..."
      download_image(url, dest) 
      i += 1
    end
  end
  puts "Downloaded #{i} images"
  nil
end

def main
    module_html = ARGV[0] || '/Users/donghao/Downloads/arhants.html'
    output_dir  = ARGV[0] || File.dirname(module_html) + "/images"
     
    process_file(module_html, output_dir)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} (optional) module_html

  EOU

  # abort usage if ARGV.length < 1

  main

end
#./create_module.rb ../docs/dzfs/04.html nCCAkgxyN6 8
