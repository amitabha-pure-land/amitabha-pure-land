#!/usr/bin/env ruby

require 'nokogiri'
require 'parse/stack'
require 'json'

def call_parse_function(name, params)
  result = Parse.call_function name, params, raw: true
  json = JSON.parse(result.to_s)
  json['result']
end

def process_file(module_html, module_id = nil)
    array = module_html.split('/')
    class_name = array[array.length - 2] + "_" + array[array.length - 1]

    csv = File.open("./csv/#{class_name}_submodules.csv", 'w')
    csv.puts "index,name,url,moduleId"

    doc = File.open(module_html) { |f| Nokogiri::HTML(f) }

    filename = "./csv/modules.csv"
    fileExisted = File.file?(filename)
    module_csv = File.open(filename, fileExisted ? 'a' : 'w')
    module_url = module_html.gsub('../docs/', '../')
    if (!fileExisted)
      module_csv.puts "objectId,name,url,index"
    end
    module_title = doc.title
    module_title.strip!

    params = {name: module_title, url: module_url, moduleId: module_id}
    result = call_parse_function 'createModule', params
    module_id = result['id']
    module_index = result['index']
    puts "created module: #{module_id}"
    module_csv.puts "#{module_id},#{module_title},#{module_url},#{module_index}"

    i = 1

    doc.css('h1').each do |h1|
      href = h1.parent.parent.last_element_child['href']
      puts "Processing #{h1.text} #{href} ..."
      csv.puts "#{i},#{h1.text},#{href},#{module_id}"

      params = {index: i, name: h1.text, url: href, moduleId: module_id}
      submoduleId = call_parse_function 'createSubmodule', params
      puts "created submodule: #{submoduleId}"

      i += 1
    end
 
  nil
end

def main
    module_html = ARGV[0]
    app_id = ARGV[1] || "NRXUJ7VoDl3pho3QihRUnN6JoRdAOPiLnV5A0vifIwE"
    master_key = ARGV[2] || "wVuwX7XYH0E2X9fmMXoxyigZI3eEzJDnAGG3B8AI4lA"
    module_id = ARGV[3] 
    
    server_url = 'http://localhost:1337/parse'

    Parse.setup app_id: app_id, master_key: master_key, server_url: server_url
             
    process_file(module_html, module_id)
end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} module_html (optional) module_id app_id master_key server_url

  EOU

  abort usage if ARGV.length < 1

  main

end
#./create_module.rb ../docs/dzfs/04.html nCCAkgxyN6 8
