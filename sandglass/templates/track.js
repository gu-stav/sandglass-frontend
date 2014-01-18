define(function() {
  return '<form class="track">' +
            '<label for="track__activity">What are you doing?</label>' +
            '<div class="track__row">' +
              '<div class="track__field track__field--inline">' +
                '<input type="text" name="activity" class="track__activity" id="track__activity" placeholder="Activity" />' +
              '</div>' +

              '<div class="track__field track__field--inline">' +
                '<input type="text" name="project" class="track__project" id="track__activity" placeholder="Project" />' +
              '</div>' +

              '<div class="track__field track__field--inline">' +
                '<input type="text" name="description" class="track__description" id="track__activity" placeholder="Description" />' +
              '</div>' +

              '<div class="track__field track__field--inline">' +
                '<button type="submit" class="track__button js-track__submit">Start</button>' +
              '</div>' +
            '</div>' +
          '</form>';
})