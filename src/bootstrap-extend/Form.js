!function ($) {

	var Form = function(element, options) {
		this.$element = element
		this.options = options
		this.originalValueSet = {}
		this.formData = {}
	}
	
	Form.prototype = {
		
		init		: function() {
			var el = this.$element
				ops = this.options
			
			if(ops.col)	el.addClass("span" + ops.col.toString())
			if(ops.layout) el.addClass("form-" + ops.layout)
			
			//el.find("button[data-toggle='submit'], button[data-toggle='submit']").data("form", el)
			
		},
		
		option		: function(name, value) {
			
			if(name && !value) return this.options[name]
			
			if(name && value) { this.options[name] = value; this.$element.attr(name, value); }
				
			return this.options
			
		},
		
		validate	: function() {
			
			var el = this.$element
				, data = this.formData
				, ops = this.options
			
			var validateResults = {result : true};
			
			el.find(".alert-error, p.validate-info").remove()
			el.find(".bs_field").removeClass("error")
			
			el.find(":input, .bs_buttongroup[toggle='radio']").each(function () {
				var fieldname = $(this).attr("name")
						|| $(this).closest(".bs_field").attr("name")
					, validateRule = eval('(' + ($(this).attr("validate") 
							|| $(this).closest(".bs_field").attr("validate")) + ')')
					
				if(validateRule !== undefined && validateRule !== "") {
					validateResults[el.attr("id") + "." + fieldname] = $(this).validate(validateRule);
					validateResults.result &= validateResults[ops.id + "." + fieldname].result;
				}
				data[fieldname] = $(this).val();
			});
						
			for(var vrn in validateResults) {
				
				if(vrn == "result" || validateResults[vrn].result) continue
				
				var fname = vrn.replace(/^[\_,a-z,A-Z,0-9]+\./i, "")
				var opdom = el
						.find(".bs_field[name='" + fname + "']")
						.removeClass("error info warning success")
				
				if(!validateResults[vrn].result) opdom.addClass("error")
				
				var p = opdom.parent(".bs_fieldset")
				if(!p) opdom.parent(".bs_form")
				
				var infopanel = p.find("div.alert-error")
				
				if(!infopanel.length) { 
					infopanel = $('<div class="alert fade in alert-error"> </div>');
					p.prepend(infopanel);
				}
				
				if(ops.layout == "compact") {
					infopanel.append('<p><strong>'
						+ opdom.find("label").text()
						+ '</strong>'
						+ validateResults[vrn].getInfo()
						+ '</p>')
				} else {
					opdom.find(".controls").append('<p class="help-inline validate-info">'
						+ validateResults[vrn].getInfo()
						+ '</p>')
				}
				
			}
			
			return validateResults.result
			
		},
		
		submit		: function(params, button) {
			
			if(button) {
				if(button.attr("loadingtext") === "" || button.attr("loadingtext") === undefined)
					button.data("button").options.loadingText = "正在提交..."
				button.button("loading")
				this.triggerButton = button
			}
			
			if(!this.validate()) {
				this.triggerButton.button('reset')
				return
			}
			
			$.extend(this.formData, params)
			
			var dom = this.$element
				, actionStr = this.options.action
				, data = this.formData
				, ops = this.options
				
			//动态提交支持
			if(actionStr.indexOf("#") === 0) {
				actionStr = eval(actionStr.substring(1));
			}
			
			if(ops.beforeSubmit) {
				ops.beforeSubmit(data);
			}
			
			//开始参数变换
			var	actionInfos = actionStr.split('.')
				, methodInfos = actionInfos[actionInfos.length - 1].match(/[^\(,\),\s]+/g)
				, args = {}
				, unmap = function(key, value, root) {
						var dotest = key.split('.')
							, arrTester = /\[([0-9]+)\]/
							, mapTester = /\[(['"])([^'"]+)\1\]/
							, setValue = function(key, value, root) {
								
								if(arrTester.test(key)) {
									var serial = key.match(arrTester)[1]
									if(!root instanceof Array) root = []
									root[serial] = value
									return
								}
								/*
								if(mapTester.test(key)) {
									var mkey = key.match(mapTester)[2]
									root[mkey] = value
									return
								}
								//*/
								root[key] = (value ? value : "")

							}

						if(dotest.length > 1) {

							if(arrTester.test(dotest[0])) {
								var serial = dotest[0].match(arrTester)[1]
									, nkey = dotest[0].replace(arrTester, "")
								
								if(!(root[nkey] instanceof Array)) root[nkey] = []
								if(!(root[nkey][serial] instanceof Object)) root[nkey][serial] = {}
								unmap(dotest.slice(1).join('.'), value, root[nkey][serial])
							/*} else if(mapTester.test(dotest[0])) {
								
							//*/	
							} else {
								if(!(root[dotest[0]] instanceof Object)) root[dotest[0]] = {}
								unmap(dotest.slice(1).join('.'), value, root[dotest[0]])
							}
						} else {
							setValue(dotest[0], value, root)
						}


					}
				, unserialor = function(name, map, root) {

						var keyTestExp = new RegExp("^" + name +"(?:\\.|$)");

						for(var key in map) {
							if(keyTestExp.test(key)) {
								unmap(key, map[key], root)
							}
						}
					}

			var target = actionInfos[0]
				+ "." + methodInfos[0]
				+ "(";

			for (var i = 1; i < methodInfos.length; ++i) {
				unserialor(methodInfos[i], data, args);
				target += ('args["' + methodInfos[i] + '"], ')
			}

			/*
			for (var i = 1; i < methodInfos.length; ++i) {
				args.push(new Object());
			}
	
			for(var p in data) {
				for(var i = 1; i < methodInfos.length; ++i) {
					if(p.split(".").length > 1) {
						var test = p.match(new RegExp("" + methodInfos[i] + ".", "g"));
						if(test != null && test.length == 1) {
							args[i-1][p] = data[p];
						};
					} else {
						if(p == methodInfos[i]) {
							args[i-1] = data[p];
						};
					}
				}
			}
			//*/
			
			
			
			/*
			var i = 0;
			while(i < (args.length - 1)) {
				target += ("args[" + i + "], ");
				++i;
			}
			//*/
			
			var callback = {
				dom		: dom,
				success	: function(data, dom) {
								eval(ops.success)(data, dom)
								button.button('reset')
							},
				error	: function(data, dom) {
								eval(ops.error)(data, dom)
								button.button('reset')
							}
			}
			
			//target += ("args[" + (args.length - 1) + "]");
			target += "callback)";

			eval(target);
			
		},
		
		val		: function(valset) {
			
			var el = this.$element
				, vals = valset ? valset : this.originalValueSet
				, setHandler = function(vals, vhead) {
						vhead = vhead ? vhead : ""
						for(var n in vals) {
							var name = vhead + n
							if(vals[n] instanceof Array) {
								for(var i in vals[n]) {
									name += ('[' + i + '].')
									setHandler(vals[n][i], name)
								}
							} else if(vals[n] instanceof Object) {
								name += "."
								setHandler(vals[n], name)
							} else {
								var inel = el.find(':input[name="' + name + '"], .btn-group[name="' + name + '"]')
								if(inel.hasClass('btn-group')) {
									inel.find(".btn").removeClass("active");
									inel.find(".btn[value='" + vals[n] + "']").addClass("active");
								}
								inel.val(vals[n])
							}
						}
					}
			
			//do clean
			el.find(".alert-error, p.validate-info").remove()
			el.find(".bs_field").removeClass("error")
			el.find(":input").each(function () {
				$(this).val("")
			})
			
			//do set
			setHandler(vals)
			
		},
		
		reset		: function(valset) {
			
			if(valset && typeof valset == "object") this.originalValueSet = valset
			
			this.val(this.originalValueSet)
			this.$element.find(".btn-group > .btn").removeClass("active");
						
		}
		
	}
	
	$.fn.form = function(option) {
	
		return this.each(function() {
			var $this = $(this)
				, data = $this.data("api")
				, options = $.extend({}, $.fn.form.defaults, typeof option == 'object' && option)
			
			if(!data) {
				$this.data("api", (data = new Form($this, options)))
				$this.find(".bs_button[data-toggle='submit'], .bs_button[data-toggle='reset']").data("form", data)
			}
			
			data.init()
			options.dom = $this;
		})
		
	}
	
	$.fn.form.defaults = {
		success	: function() {console.log("Form submit Success!")},
		error	: function() {console.log("Form submit Failed!")}
	}
	
	$(function() {
		$('body')
			.on("click.form.submit", "[data-toggle='submit'], [data-toggle='reset']", function(e) {
			
				var $this = $(this)
					, form = $this.data("form")
				
				if(!form && !$this.attr("form")) {
					console.error("Button with form-action can NOT bind without any form!")
					return
				}
				
				if(!form) $this.data("form", (form = $($this.attr("form")).data("api")))
					
				form[$this.attr("data-toggle")](null, $this);
				
			})
			
	})	
	
}(window.jQuery)