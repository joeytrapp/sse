(function() {
  var source = new EventSource('/register'),
      form = document.querySelector('#form'),
      csrf, initial;

  initial = new XMLHttpRequest();
  initial.open('get', '/');
  initial.onreadystatechange = function() {
    csrf = this.getResponseHeader('X-Csrf-Token');
  };
  initial.send();

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
      if (csrf) {
        xhr.setRequestHeader('X-Csrf-Token', csrf);
        // data.append('csrf_token', csrf);
      }
      xhr.send(data);
      event.preventDefault();
      event.stopPropagation();
    });
  };
}());
