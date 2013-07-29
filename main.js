var templates = require('./formyjs.js')()

var $modal = $('.modal')

function setInCentre () {
  var top = parseInt($(window).height() - this.height(), 10) /2
  this.css('top', (top < 0) ? 0 : top)
  this.css('left', parseInt($(window).width() - this.width(), 10) /2)
}

setInCentre.bind($modal)
$modal.hide()

var doASave = function () {
  console.log('doASave')
}

$('#newTicket a').click (function () {
  console.log('open new Ticket')
  var tplNewTicketForm = templates('.modal', '#tplNewTicketForm')
  // console.log(tplNewTicketForm)
  // tplNewTicketForm.save.click(tplNewTicketForm.validateForm)
  tplNewTicketForm.cancel.click(tplNewTicketForm.destroy)
  
  // tplNewTicketForm.save.click(tplNewTicketForm.saveForm.bind(this, doASave))

  // tplNewTicketForm.saveForm()
  // tplNewTicketForm.saveForm(doASave)
  // tplNewTicketForm.saveForm('click')
  tplNewTicketForm.saveForm('click', doASave)

})

/*
  .save() // run 'save'
  .save(func) // run 'save' and then func
  .save('click') // add click event to save element, and onClick run 'save' then func
  .save('click', func) // add click event to save element, and onClick run 'save' then func
*/

/*
console.log(tplNewTicketForm)
console.log(tplNewTicketForm.fields.application.get())
// console.log(tplNewTicketForm.fields.application.set('world'))
console.log(tplNewTicketForm.fields.application.get())
console.log(tplNewTicketForm.fields.application.type)
console.log(tplNewTicketForm.getFormValues())
console.log(tplNewTicketForm.fields.application.val())
// console.log(tplNewTicketForm.fields.application.val('bob'))
console.log(tplNewTicketForm.fields.application.val())

// $('.searchResults').html(tplNewTicketForm.html)

console.log('form test - data')
console.log(tplNewTicketForm.val())
console.log(tplNewTicketForm.val({type: 'fred'}))
console.log(tplNewTicketForm.val())

console.log('')
console.log('validation')
console.log('title')
console.log('is valid: ', tplNewTicketForm.fields.title.validate())
console.log('is valid: ', tplNewTicketForm.fields.title.validation.errors)

console.log('')
console.log('validation')
console.log('application')
console.log('is valid: ', tplNewTicketForm.fields.application.validate())
console.log('is valid: ', tplNewTicketForm.fields.application.validation.errors)

console.log('')
console.log('validation')
console.log('form')
console.log('form isValid?: ', tplNewTicketForm.validateForm())

console.log(tplNewTicketForm.fields.application.validation.errors)*/

// console.log('')
// console.log('validation')
// console.log('patients')

// console.log('is valid: ', tplNewTicketForm.fields.patients.validate())
// console.log('is valid: ', tplNewTicketForm.fields.patients.validation.errors)

// window.patientsField = tplNewTicketForm.fields.patients

