#!/usr/bin/env ruby

require 'nokogiri'

def process_one_file(template_file, input_file, title, textbook_link, lineage_link)
    template = File.read(template_file)
    template = template.gsub('class_title', title)
    template = template.gsub('textbook_link', textbook_link)
    template = template.gsub('lineage_link', lineage_link)

    new_node = Nokogiri::HTML(template)
  
    doc = File.open(input_file) { |f| Nokogiri::HTML(f) }
    node = doc.at_css('article')
    node.first_element_child.replace(new_node.at_css('div'))

    result = doc.to_s
        
    File.open(input_file, 'w') { |file| file.write(result) } 
    puts "Done for #{doc.title} - #{input_file}"
end

def process_index(template_file, input_dir, output_dir)
    csv = File.open('./csv/rxl_sessions.csv', 'w')
    csv.puts "name,url"

    index_file = output_dir + "index.html"
    puts index_file
    doc = File.open(index_file) { |f| Nokogiri::HTML(f) }
    puts doc.title

  doc.css('h1').each do |h1|
    href = h1.parent['href']
    puts "Processing #{h1.text} #{href} ..."
    csv.puts "#{h1.text},../rpsxl/%E4%B8%8A%E5%B8%88%E8%AE%B2%E8%AE%B0/#{href}"

    faben = h1.parent.next_sibling.next_sibling.next_sibling.next_sibling.next_sibling.next_sibling
    # puts "faben #{faben['href']} ..."

    chuancheng = faben.next_sibling.next_sibling
    # puts "chuancheng #{chuancheng['href']} ..."
    
    input_file  = input_dir + href
    output_file  = output_dir + href
    process_one_file(template_file, input_file, h1.text, faben['href'], chuancheng['href'])
  end
  
  nil
end

def main
    template_file = ARGV[0]
    input_dir = ARGV[1]
  
    output_dir = input_dir
    if ARGV.length > 2
        output_dir = ARGV[2]
    end

    process_index(template_file, input_dir, output_dir)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} template_file input_dir (optional)output_dir

  EOU

  abort usage if ARGV.length < 2

  main

end
