require 'json'
require 'faye/websocket'

class App
  attr_reader :root, :logger

  def initialize
    @root = File.dirname(File.dirname(__FILE__))
    path = File.join root, 'tmp', 'debug.log'
    @logger = Logger.new STDOUT
  end

  def connections
    @connections ||= []
  end

  def call env
    path = env['PATH_INFO']

    case path
    when /\/register/ then register env
    when /\/notify/ then notify env
    when /\.js$/ then javascript path
    else index
    end
  end

  def index
    path = File.join root, 'public', 'index.html'
    [200, { 'Content-Type' => 'text/html' }, File.read(path)]
  end

  def javascript file
    path = File.join root, 'public', file
    [200, { 'Content-Type' => 'text/javascript' }, File.read(path)]
  end

  def register env
    if Faye::EventSource.eventsource? env
      es = Faye::EventSource.new env
      connections << es

      logger.info "#{connections.length} connections"
      es.on :close do |event|
        logger.info 'Closing connection'
        connections.delete es
        es = nil
      end
      es.rack_response
    else
      [404, {}, '']
    end
  end

  def notify env
    req = Rack::Request.new(env)
    if req.post?
      connections.each do |connection|
        data = JSON.generate({ message: req.params['message'], timestamp: Time.now.to_i })
        connection.send data, event: req.params['channel']
      end
      [201, {}, '']
    else
      [404, {}, '']
    end
  end
end
