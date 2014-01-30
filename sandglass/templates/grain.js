define(function(){
  return '<li class="timeline__item timeline__item--track <% if( conflictWithBefore ) { %> timeline__item--conflictWithPrevious <% } %>">' +
         '<i class="fa fa-bolt timeline__item--conflictWithPrevious-icon"></i>' +
         '<strong class="timeline__group">${ startGroupedParsed }</strong>' +
         '<div><i class="timeline__circle fa fa-circle"></i>' +
         '<strong class="timeline__duration">${ duration }</strong>' +
         '<button class="timeline__item-delete timeline__button button button--link"><i class="fa fa-trash-o"></i></button>' +
         '<button class="timeline__item-end timeline__button button button--link"><i class="fa fa-pause"></i></button>' +
         '<button class="timeline__item-restart timeline__button button button--link"><i class="fa fa-retweet"></i></button>' +
         '<h2 class="timeline__headline"><span class="timeline__activity" contenteditable>${ activity }</span> - <span contenteditable class="timeline__project">${ project }</span></h2><p class="timeline__description" contenteditable>${ parsedDescription }</p>' +
         '</div><small class="timeline__parsedStartEnd"><span class="timeline__parsedStarted" contenteditable>${ parsedStarted }</span> - <span class="timeline__parsedEnded" contenteditable>${ parsedEnded }</span></small></li>'
});