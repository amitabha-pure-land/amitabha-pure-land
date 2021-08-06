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

def process_node(node, template_file1, class_title, class_html, textbook_link, lineage_link)
    template = File.read(template_file1)
    template = template.gsub('class_title', class_title)
    template = template.gsub('class_html', class_html)
    template = template.gsub('textbook_link', textbook_link)
    template = template.gsub('lineage_link', lineage_link)

    new_node = Nokogiri::HTML(template)
    node2 = node.replace(new_node.at_css('div'))

    #puts "Node: #{node2.to_s}"
end

def process_index(template_file1, template_file2, input_dir, output_dir, moduleId)
    array = input_dir.split('/')
    class_name = array[array.length - 1]

    csv = File.open("./csv/#{class_name}_submodules.csv", 'w')
    csv.puts "index,name,url,moduleId"

    index_file = output_dir + "index.html"
    puts index_file
    doc = File.open(index_file) { |f| Nokogiri::HTML(f) }
    puts doc.title

    youtube_csv = File.open("./csv/#{class_name}_youtube.csv", 'r')
    youtube_csv.readline #skip first line

    doc.css('h1').each do |h1|
        href = h1.parent['href']
        puts "Processing #{h1.text} #{href} ..."

        array = youtube_csv.readline.strip!.split(',')
        index = array[0]
        title = array[1]
        chuancheng = array[2]

        csv.puts "#{index},#{title},../#{class_name}/#{href},#{moduleId}"

        faben = "./doc/#{title}.docx"

        process_node(h1.parent.parent.parent, template_file1, title, href, faben, chuancheng)
        
        input_file  = input_dir + href
        output_file  = output_dir + href
        process_one_file(template_file2, input_file, title, faben, chuancheng)
    end

    result = doc.to_s    
    File.open(index_file, 'w') { |file| file.write(result) }
  
  nil
end

def main
    template_file1 = ARGV[0]
    template_file2 = ARGV[1]
    input_dir = ARGV[2]
    moduleId = ARGV[3]
  
    output_dir = input_dir

    process_index(template_file1, template_file2, input_dir, output_dir, moduleId)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} template_file1 template_file2 input_dir moduleId

  EOU

  abort usage if ARGV.length < 4

  main

end

#./cx_index.rb templates/qxgs_session.html templates/checkbox.html ../docs/lxfhj/ APljoXNn6a
#./cx_index.rb templates/qxgs_session.html templates/checkbox.html ../docs/zhzcdn/ 37y7Nbat2W
