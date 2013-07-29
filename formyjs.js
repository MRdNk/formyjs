var moment = require('moment')
var isJSON = require('./isJSON')

var formyjs = function (opts) {
  return function (container, template) {

    var self = this
    var that = {}
    var opts = opts || {}

    self.formFieldKey = opts.formFieldKey || 'data-form-field-key'
    self.formFieldValidationKey = opts.formFieldValidationKey || 'data-form-field-validation'
    self.formActionsKey = opts.formActionsKey || 'data-form-actions'

    self.container = (typeof container === 'string') ? $(container) : container
    that.html = self.container.html($(template).html())

    that.fields = {}
    that.btns = {}
    that.getFormValues = null
    that.setFormValues = null

    // gets the elements value => getter
    self.getValue = function () {
      if (this.type === 'checkbox') return this.elem.prop('checked')
      else return this.elem.val()
    }
    // sets the elements value => setter
    self.setValue = function (value) {
      if (this.type === 'checkbox') this.elem.prop('checked', value)
      else this.elem.val(value)
      return true
    }
    // gets the element type, useful for the getter and setter
    self.getType = function () {
      var tag = this.get(0).tagName.toLowerCase()
      switch (tag) {
        case 'input': 
          return this.attr('type') || 'text'
          break;
        default:
          return tag
          break;
      }
    }

    // fetches the label for an input element
    self.getFieldLabel = function () {
      return $(that.html).find("label[for='" + this.elem.attr('id') + "']")
    }

    self.getFieldLabelText = function () {
      return this.label.html()
    }

    // helper method to allow to make get and set similar interface to jQuery
    // .val() => getter
    // .val(aValue) => setter
    self.val = function (value) {
      if (value)
        return this.set(value)
      else
        return this.get()
    }

    // logic to validate a field
    self.validateField = function () {
      this.validation.errors = []
      var field = this
      var rules = null
      if (!this.validation.rules)
        return true
      else {
        rules = this.validation.rules.replace(/ /g,'').split(';')
        var failures = []
        var pass = true

        // console.log(rules)
        $.each(rules, function (key, value) {
          // console.log(key, value)

          pass = validate(value, field, function (err) {
            if (err) failures.push(err)
          })

        })
        // this.validation.errors = failures
        return pass
      }

      // runs each validation type against the field and returns a result
      function validate(type, field, cb) {
        // console.log('isJSON: ', isJSON(type))
        function addError (err) {
          if (err)
            field.validation.errors.push(err)
          // caseb(err)
        }
        var pass = true
        switch (type) {
          case 'required': 
            pass = (required(field,addError) === false) ? false : pass
            break;

          case 'date':
            pass = (date(field, addError) === false) ? false : pass
            break;

          default: 
            if(isJSON(type) !== false) {
              pass = (dependents(field, type, addError) === false) ? false : pass
            }
            break;
        }

        return pass
      }

      // required field validator
      function required (field, cb) {
        if (field.val() === '') {
          cb ('Required field')
          return false
        }
        else return true
      }

      // date field validator
      function date (field, cb) {
        var required = (rules.indexOf('required') === -1) ? false : true
        if (field.val() === '' && required === false) return true
        else {
          if (moment(field.val()) !== null && moment(field.val(), 'DD-MM-YYYY').isValid() === true) return true
          else {
            cb ('Invalid date')
            return false
          }
        }
      }

      function dependents (field, json, cb) {
        /* 
        => if 'patients' (field) 'has value' then 'application' (field) is 'required'
        patients: {
          hasValue: { 
            application: "required"
          }
        }
        */
        var pass = null
         
        var dependency = JSON.parse(json)
        $.each(dependency, function (key, value) {
          switch (key) {
            case 'hasValue': 
              if (field.val() === "") {/*ignore*/}
              else {
                $.each (value, function (key2, value2) {
                  // validate(value2, that.fields[key2], cb)
                  // pass = true
                  if (validate(value2, that.fields[key2], cb) === true) pass = true
                  else pass = false
                })
                
              }
              break;
          }
        })
        return pass
      }
    }

    // sets up the form object and functions
    self.getFormFields = function () {
      var formFields = $(that.html).find('['+ self.formFieldKey +']')
      var fields = {}
      formFields.each(function (i, elem) {
        var elem = $(elem)
        var key = $(elem).attr(self.formFieldKey)
        var validation = elem.attr(self.formFieldValidationKey) || ''

        fields[key] = {}
        fields[key].elem = elem
        fields[key].type = self.getType.bind(elem).call()
        fields[key].get = self.getValue.bind(fields[key])
        fields[key].set = self.setValue.bind(fields[key])
        fields[key].val = self.val.bind(fields[key])
        fields[key].label = self.getFieldLabel.bind(fields[key]).call()
        fields[key].labelText = self.getFieldLabelText.bind(fields[key]).call()
        fields[key].validation = {} 
        fields[key].validation.rules = validation
        fields[key].validation.errors = []
        fields[key].validate = self.validateField.bind(fields[key])
      })
      that.fields = fields
    }()

    // adds action buttons such as Save and Cancel to 'that.btns' & the 'that' object
    self.addActionBtns = function () {
      var formBtns = $(that.html).find('['+ self.formActionsKey +']')
      var btns = {}

      formBtns.each(function (i, elem) {
        var elem = $(elem)
        var key = elem.attr(self.formActionsKey)
        btn = btns[key] = elem
        that[key] = elem
      })
      that.btns = btns
    }()

    // public helper method get/set as defined above
    that.val = function (data) {
      if (data) return self.setFormValues(data)
      else return self.getFormValues()
    }

    // gets all the form values and returns an object of values
    that.getFormValues = self.getFormValues = function () {
      var data = {}
      $.each (that.fields, function (key, value) {
        data[key] = value.get()
      })
      return data
    }

    // sets all the form values, an object passed in replaces any form values
    that.setFormValues = self.setFormValues = function (data) {
      $.each (that.fields, function (key, value) {
        value.set(data[key])
      })
      return true
    }
    
    // vaidates the whole form, does a for each of each field
    that.validateForm = self.validateForm = function () {
      var errors = {}
      $.each(that.fields, function (key, field) {
        field.validate()
      })
      $.each(that.fields, function (key, field) {
        if (field.validation.errors.length > 0) {
          errors[key] = {
            errors: field.validation.errors,
            elem: field.elem,
            labelText: field.labelText
          }
          // adds some fail classes to the element and it's label
          field.label.addClass('error')
          field.elem.addClass('error')
        } else {
          field.label.removeClass('error')
          field.elem.removeClass('error')
        }
      })
      console.log(errors)
      if (errors.length === 0) return true
      return errors
    }


    /*
      .save() // run 'save'
      .save(func) // run 'save' and then func
      .save('click') // add click event to save element, and onClick run 'save' then func
      .save('click', func) // add click event to save element, and onClick run 'save' then func
    */
    self.save = function () {
      // console.log('save: ', func)
      console.log('arguments: ', arguments)
      var isValid = null

      switch (arguments.length) {
        case 0:
          isValid = self.isValidForm()
          break;
        case 1:
          if(typeof arguments[0] === 'function') {
            isValid = self.isValidForm()
            if (isValid) {
              arguments[0]()
            }
          } else if (typeof arguments[0] === 'string') {
            that.btns.save[arguments[0]](function () {
              self.save()
            })
          }
          break;
        case 2:
          if(typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
            that.btns.save[arguments[0]](function () {
              self.save(arguments[0])
            }.bind(null, arguments[1]))
          }
          break;
        default:
          throw new Error()
      }


      /*var valid = 
      if (func && valid) func()
      console.log('save me')*/
    }

    self.isValidForm = function () {
      return ($.isEmptyObject(self.validateForm())) ? true : false
    }

    that.saveForm = self.save

    that.destroy = function () {
      console.log('destroy')
      self.container.empty()
      self.container.hide()
    }

    self.container.show()

    return that
  }
}

module.exports = formyjs