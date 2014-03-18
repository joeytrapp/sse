(function() {
  var source = new EventSource('/register'),
      form = document.querySelector('#form'),
      cookies;

  cookies = document.cookie.split(';').reduce(function(m, i) {
    var bits = i.split('=');
    m[bits.shift().trim()] = bits.join('=').trim();
    return m;
  }, {});

  source.addEventListener('chat', function(response) {
    var messages = document.querySelector('#messages'),
        message = document.createElement('section'),
        params = JSON.parse(response.data);
        input = form.querySelector('input'),
        date = new Date(params.timestamp * 1000);
    message.innerHTML = '<p><span>' + date.toTimeString() + '</span><br>' +  params.message + '</p>';
    messages.appendChild(message);
    input.value = '';
    input.focus();
  });

  window.onload = function() {
    form.addEventListener('submit', function(event) {
      var value = event.srcElement.querySelector('input').value,
          xhr = new XMLHttpRequest()
          data = new FormData();
      data.append('message', value);
      data.append('channel', 'chat');
      xhr.open('post', '/notify', true);
      if (cookies.csrf_token) {
        xhr.setRequestHeader('X-Csrf-Token', cookies.csrf_token);
        // data.append('csrf_token', cookies.csrf_token);
      }
      xhr.send(data);
      event.preventDefault();
      event.stopPropagation();
    });
  };
}());
