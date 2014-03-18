$LOAD_PATH.unshift File.dirname(__FILE__)

require 'rack'
require 'app'

run App.new
