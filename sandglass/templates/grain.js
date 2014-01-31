define(function(){
  return '<li class="timeline__item timeline__item--track">' +
            '<i class="fa fa-bolt timeline__item--conflictWithPrevious-icon"></i>' +

            '<strong class="timeline__group">${ startGroupedParsed }</strong>' +

            /* action buttons */
            '<button class="timeline__item-delete timeline__button button button--link"></button>' +
            '<button class="timeline__item-end timeline__button button button--link"></button>' +
            '<button class="timeline__item-restart timeline__button button button--link"></button>' +

            /* activity & project */
            '<h2 class="timeline__headline">' +
               '<span class="timeline__activity" contenteditable>${ activity }</span> - ' +
               '<span contenteditable class="timeline__project">${ project }</span>' +
            '</h2>' +

            /* description */
            '<p class="timeline__description" contenteditable>${ parsedDescription }</p>' +

            '<div class="timeline__time">'+
               '<strong class="timeline__duration">${ duration }</strong>' +
               '<small class="timeline__parsedStartEnd">' +
                  '<span class="timeline__parsedStarted" contenteditable>${ parsedStarted }</span>' +
                  ' - <span class="timeline__parsedEnded" contenteditable>${ parsedEnded }</span>' +
               '</small>' +
            '</div>' +
         '</li>'
});