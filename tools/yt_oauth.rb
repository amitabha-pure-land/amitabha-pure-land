require 'sinatra'

get '/oauth2callback' do
  puts params[:code]
  Process.kill('TERM', Process.pid)
end

puts "PID: #{Process.pid}"