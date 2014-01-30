define(function() {
  return '<div  class="track"><form>' +
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
          '</form>' +

          '<form class="sandglass__search">' +
          '<div class="sandglass__sortby"><i class="fa fa-sort sandglass__sortby-icon"></i>' +
          '<button class="sandglass__sortby-button sandglass__sortby-button--active" value="started">Date</button>' +
          '<button class="sandglass__sortby-button" value="activity">Activity</button>' +
          '<button class="sandglass__sortby-button" value="project">Project</button></div>' +
          '<div class="sandglass__search-startend">' +
            '<i class="fa fa-search sandglass__search-icon"></i>' +
            '<input type="text"' +
                   'class="sandglass__search-start"' +
                   'name="filter_start"' +
                   'placeholder="always" />' +
            '- ' +
            '<input type="text"' +
                   'class="sandglass__search-end"' +
                   'name="filter_end"' +
                   'placeholder="today" />' +
          '</div>' +
        '</form></div>';
})