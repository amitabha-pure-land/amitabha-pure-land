#!/usr/bin/env ruby

require 'nokogiri'
require 'csv'

def process_node(node, template_file2, speech_id, speech_title, textbook_link, youtube_speech, youtube_qa)
    template = File.read(template_file2)
    template = template.gsub('speech_id', speech_id)
    template = template.gsub('speech_title', speech_title)
    template = template.gsub('textbook_link', textbook_link)

    if youtube_speech
        template = template.gsub('youtube_speech', youtube_speech)
    else
        template = template.gsub('<a class="mdui-btn mdui-ripple mdui-ripple-white coun-read mdui-text-color-theme-accent" href="youtube_speech" target="_blank">观看演讲</a>', "")
    end

    if youtube_qa
        template = template.gsub('youtube_qa', youtube_qa)
    else
        template = template.gsub('<a class="mdui-btn mdui-ripple mdui-ripple-white coun-read mdui-text-color-theme-accent" href="youtube_qa" target="_blank">观看问答</a>', "")
    end

    new_node = Nokogiri::HTML(template)
    node2 = node.add_child(new_node.at_css('div'))
end

def get_href_id(input_dir, index, page_no)
    html = File.read("#{input_dir}/#{index}/index.html")
    doc = Nokogiri::HTML(html)
    element = doc.at_css("div[data-page-url='#{index}-#{page_no}.page']")
    element["id"]
end

def process_one_file(csv, template_file1, template_file2, input_dir, output_dir, index, class_title, onedrive1, onedrive2)
    template = File.read(template_file1)
    template = template.gsub('class_title', class_title)
    template = template.gsub('iframe_placeholder', onedrive1)

    doc = Nokogiri::HTML(template)
  
    node = doc.at_css('article')
    # puts node
    speech_id = 1
    table = CSV.parse(File.read("./csv/self_study_submodules.csv"), headers: true)
    table.each do |r|
        if r[0] && r[0].match(/^\d+$/)
            if index == "%02d" % r[0].to_i
                page_no = r[1]
                speech_title = r[2]
                youtube_speech = r[3]
                youtube_qa = r[4]

                csv.puts "#{index},#{class_title},#{speech_id},#{speech_title}"

                if onedrive2
                    href_id = "page_#{page_no}"
                else
                    href_id = get_href_id(input_dir, index, page_no)
                end
                textbook_link = "#{index}/" + '#' + href_id
                process_node(node, template_file2, speech_id.to_s, speech_title, textbook_link, youtube_speech, youtube_qa)
                speech_id += 1
            end
        end
    end

    result = doc.to_s
        
    File.open("#{output_dir}/#{index}.html", 'w') { |file| file.write(result) } 
    puts "Done for #{doc.title}"
end

def pdf2html(input_dir, output_dir, index, name)
    puts `pdf2htmlEX --zoom 1.5 --embed cfijo --split-pages 1 --dest-dir #{output_dir}/#{index}/ --page-filename #{index}-%d.page #{input_dir}/#{name}.pdf`
    puts `mv #{output_dir}/#{index}/#{name}.html #{output_dir}/#{index}/index.html`
    puts `ls -lt #{output_dir}/#{index}/*.html`
end

def process_index(template_file1, template_file2, input_dir, output_dir)
    csv = File.open("./csv/self_study_sessions_out.csv", 'w')
    csv.puts "sessionId,sessionTitle,speechId,speechTitle"

    table = CSV.parse(File.read("./csv/self_study_sessions.csv"), headers: true)
    table.each do |r|
        index = "%02d" % r[0]
        name = r[1]
        onedrive1 = r[2]
        onedrive2 = r[3]
        process_one_file(csv, template_file1, template_file2, input_dir, output_dir, index, name, onedrive1, onedrive2)
        # pdf2html(input_dir, output_dir, index, name)
    end
  nil
end

def main
    template_file1 = ARGV[0]
    template_file2 = ARGV[1]
    input_dir = ARGV[2]
  
    output_dir = input_dir
    if ARGV.length > 3
        output_dir = ARGV[3]
    end

    process_index(template_file1, template_file2, input_dir, output_dir)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} template_file1 template_file2 input_dir (optional)output_dir

  EOU

  abort usage if ARGV.length < 3

  main

end
#./dxyj.rb templates/dxyj_template.html templates/one_speech.html ../docs/dxyj