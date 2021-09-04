require 'sinatra'
require 'json'

get '/oauth2callback' do
  STDERR.puts params[:code]
  Process.kill('TERM', Process.pid)
  params.to_json
end

puts "PID: #{Process.pid}"