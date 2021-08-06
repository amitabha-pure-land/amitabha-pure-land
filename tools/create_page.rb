#!/usr/bin/env ruby

require 'nokogiri'
require 'csv'

def process_node(node, template_file2, submodule_id, submodule_title, youtube_url)
    template = File.read(template_file2)
    template = template.gsub('submodule_id', submodule_id)
    template = template.gsub('submodule_title', submodule_title)
    template = template.gsub('youtube_url', youtube_url)

    new_node = Nokogiri::HTML(template)
    node2 = node.add_child(new_node.at_css('div'))
end

def process_one_file(template_file1, template_file2, input_dir, output_dir, index, class_title, youtube_csv)
    template = File.read(template_file1)
    template = template.gsub('title_to_be_replaced', class_title)

    doc = Nokogiri::HTML(template)
  
    node = doc.at_css('article')
    # puts node
    submodule_id = 1
    table = CSV.parse(File.read(youtube_csv), headers: true)
    table.each do |r|
        submodule_title = r[3]
        youtube_url = r[1]

        submodule_title += "(未找到視頻)" if !youtube_url
        youtube_url = "" if !youtube_url

        puts "#{index},#{class_title},#{submodule_id},#{submodule_title},#{youtube_url}"

        process_node(node, template_file2, submodule_id.to_s, submodule_title, youtube_url)
        submodule_id += 1
    end

    result = doc.to_s
        
    File.open("#{output_dir}/#{index}.html", 'w') { |file| file.write(result) } 
    puts "Done for #{doc.title}"
end

def process_index(template_file1, template_file2, input_dir, output_dir, youtube_csv, index)
    name = File.basename(youtube_csv, ".*")
    index = "%02d" % index
    process_one_file(template_file1, template_file2, input_dir, output_dir, index, name, youtube_csv)

    index_html = File.read("#{input_dir}/index.html")
    doc = Nokogiri::HTML(index_html)
    node = doc.css("ol#generated_list")[0]
    list_element = "<li><a href=\"#{index}.html\">#{name}</a></li>"
    new_node = Nokogiri::HTML(list_element)
    node.add_child(new_node.at_css('li'))

    result = doc.to_s
    File.open("#{output_dir}/index.html", 'w') { |file| file.write(result) } 
  nil
end

def main
    template_file1 = 'templates/page_template.html'
    template_file2 = 'templates/one_video.html'
    youtube_csv = ARGV[0]
    index = ARGV[1]
    input_dir = ARGV[2]
  
    output_dir = input_dir
    if ARGV.length > 3
        output_dir = ARGV[3]
    end

    process_index(template_file1, template_file2, input_dir, output_dir, youtube_csv, index)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} youtube_csv index input_dir (optional)output_dir

  EOU

  abort usage if ARGV.length < 3

  main

end
#./dzfs.rb   ../mclhs