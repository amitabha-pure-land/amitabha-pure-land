#!/usr/bin/env ruby

require 'nokogiri'

def refresh_one_file(template_file, input_file, output_file, level)
  template = File.read(template_file)

  if level > 0
    rel_path = ''
    while level > 0 
      rel_path = rel_path + "../"
      level -= 1
    end
    #puts rel_path
    template = template.gsub('./', rel_path)
  end 

  doc = File.open(input_file) { |f| Nokogiri::HTML(f) }
  node = doc.at_css('article')
  is_main = false

  doc.css('span').each do |span|
    if span['class'] == 'info'
      span.remove()
    end
  end

  if node == nil
    node = doc.at_css('main')
    if node == nil
      puts "Skipping file #{doc.title} - #{input_file}"
      return
    end
    is_main = true
  end
  
  # if ["smartideo", "wp-video"].include?(node.first_element_child['class'])
  #   #puts "Removed smartvideo <div>"
  #   node.first_element_child.remove
  # end

  #result = template.sub('<article />', node.to_s.gsub('"../', '"'))
  #<p style="text-align:center;"><img src="../../../y3.ifengimg.com/a/2015_27/97991df4bd18526_size27_w410_h273.jpg"></p>
  node.css('p').each do |p|
    img = p.first_element_child
    if img && img["src"] && img["src"].include?("fengimg.com")
      p.remove()
    end
  end

  result = template.sub('<article />', node.to_s)
  result = result.gsub('title_to_be_replaced', doc.title)

  if is_main
    result = result.gsub('<main class="postList mdui-center hello" id="postlist">', '<article class="post-773291 post type-post status-publish format-standard has-post-thumbnail hentry category-2  mdui-typo" id="post-773291" itemprop="articleBody">')
    result = result.gsub('</main>', '</article>')
  end

  #（图片来源：凤凰网华人佛教 摄影：曹立君）
  result = result.gsub(/（图片来源：.*）/, '')

  File.open(output_file, 'w') { |file| file.write(result) } 
  puts "Done for #{doc.title} - #{output_file}"
end

def process_index_bk(input_dir, output_dir)
  index_file = output_dir + "/index.html"
  puts index_file
  doc = File.open(index_file) { |f| Nokogiri::HTML(f) }
  puts doc.title

  doc.css('h1').each do |h1|
    href = h1.parent['href']

    #filename = href.sub('/', '/rxl/index.php/archives/')
    puts "Processing #{h1.text} #{href} ..."
    #refresh_one_file(filename)
  end
  nil
end

def main
  template_file = ARGV[0]
  #puts "template_file: #{template_file}"

  input_file = ARGV[1]
  #puts "input_file: #{input_file}"

  output_file = input_file
  if ARGV.length > 2
    output_file = ARGV[2]
  end

  level = 0
  if ARGV.length > 3
    level = ARGV[3].to_i
  end

  refresh_one_file(template_file, input_file, output_file, level)

end


if __FILE__ == $0
  usage = <<-EOU

usage: ruby #{File.basename($0)} template_file input_file  (optional)output_file (optional)level

  EOU

  abort usage if ARGV.length < 2

  main

end

if __FILE__ == $0
  #process_list('list1.html')
  #process_list('list2.html')
end