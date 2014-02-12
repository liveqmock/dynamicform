(function($) {
    /**
     * GUID是一种由算法生成的二进制长度为128位的数字标识符。GUID 的格式为“xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx”，
     * 其中的 x 是 0-9 或 a-f 范围内的一个32位十六进制数。在理想情况下，任何计算机和计算机集群都不会生成两个相同的GUID。
     * @returns
     */
    $.uuid = function() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
     
        var uuid = s.join("");
        return uuid;
    };
    
    $.substitute = function(str, o, regexp) {
        /**
         * ${XXX} style will be replaced by this method.
         */
        var callback = function(match, name) {
            return (o[name] == undefined) ? '' : o[name];
        };
        return str.replace(regexp || /\$\{([^{}]+)\}/g, callback);
    };
    /* abstract class for all Elements */
    function Component(options) {
        this.id = options.id;
        this.name = options.name;
        this.type = undefined;
        this.xmltemplate = "";
        this.toXml = function() {
            return $.substitute('<element type="${type}">'+this.xmltemplate+'</element>', this);
        },
        this.htmltemplate = "";
        this.toHtml = function(){
            return $.substitute('<div id="block_${id}" class="connectedSortable"><label for="${id}">${label}</label>'+this.htmltemplate+'<img id="img_${id}" width="16" height="16" class="handle" alt="move" src="img/arrow.png"></div>', this);
        }
    };
    
    var component = new Component({});

    /* abstract class for Input */
    function Input(options) {
        Component.call(this, options);
        this.label = options.label;
        this.value = options.value;
        this.size = options.size;
        this.maxlength = options.maxlength;
        this.required = options.required;
        this.readonly = options.readonly;
        this.helptext = options.helptext;
    };
    
    Input.protottype = component;
    var input = new Input({});
    /* sub-class for FieldSet */
    function FieldSet(options) {
        this.constructor = FieldSet;
        Component.call(this, options);
        this.width = options.width;
        this.height = options.height;
        this.label = options.label;
        this.elements = [];
        this.addElement = function(obj) {
            this.elements.push(obj);
        };
        this.xmltemplate = '<fieldset id="${id}" name="${id}" width="${width}" height="${height}" legend="${label}">${subElements}\n</fieldset>';
        this.toXml = function() {
            this.subElements = "";
            for ( var i = 0; i < this.elements.length; i++) {
                this.subElements += "\n" + this.elements[i].toXml();
            }
            return $.substitute(this.xmltemplate, this);
        };
        this.htmltemplate = '<fieldset id="block_${id}" name="${id}" style="width:${width}px;height:${height}px" class="connectedSortable"><legend><img id="img_${id}" width="16" height="16" class="handle" alt="move" src="img/arrow.png">${label}</legend></fieldset>';
        this.toHtml = function(){
            return $.substitute(this.htmltemplate, this);
        }
    };
    
    FieldSet.prototype = component;
    
    /* sub-class for Form */
    function Form(options) {
        Component.call(this, options);
        this.constructor = Form;
        this.template = '<tns:form xmlns:tns="http://www.dynamic.org/dynamicform" action="${action}" method="${method}">${subFieldSets}\n</tns:form>';
        this.fieldSets = [];
        this.addFieldSets = function(obj) {
            this.fieldSets.push(obj);
        };
        this.toXml = function() {
            this.subFieldSets = "";
            for ( var i = 0; i < this.fieldSets.length; i++) {
                this.subFieldSets += "\n" + this.fieldSets[i].toXml();
            }
            return $.substitute(this.xmltemplate, this);
        };
        this.htmltemplate = '<form id="${id}" name="${name}" width="${width}" height="${height}"></form>';
    }
    Form.prototype = component;
    
    /* sub-class for Image */
    function Image(options) {
        Component.call(this, options);
        this.constructor = Image;
        this.src = options.src;
        this.helptext = options.helptext;
        this.xmltemplate = '<image id="${id}" name="${name}" src="${src}"></image>';
        this.htmltemplate = '<img id="${id}" name="${name}" src="${src}" width="${width}" height="${height}">';
    }
    Image.prototype = component;

    /* sub-class for Button */
    function Button(options) {
        Component.call(this, options);
        this.constructor = Button;
        this.xmltemplate = '<button id="${id}" name="${name}" value="${value}" helptext="${helptext}"/>';
        this.htmltemplate = '<input class="form-control" type="submit" id="${id}" name="${name}" value="${value}">';
    }
    Button.prototype = component;

    /* sub-class for Checkbox */
    function Checkbox(options) {
        Input.call(this, options);
        this.constructor = Checkbox;
        this.listvalue = options.listvalue;
        this.xmltemplate = '<checkbox id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" listvalue="${listvalue}" helptext="${helptext}"/>';
        this.htmltemplate = '<input type="checkbox" id="${id}" name="${name}" value="${value}">';
    }
    Checkbox.prototype = input;

    /* sub-class for Radio */
    function Radio(options) {
        Input.call(this, options);
        this.constructor = Radio;
        this.listvalue = options.listvalue;
        this.xmltemplate = '<radio id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" listvalue="${listvalue}" helptext="${helptext}"/>';
        this.htmltemplate = '<input type="radio" id="${id}" name="${name}" value="${value}">';
    }
    Radio.prototype = input;

    /* sub-class for Text */
    function Text(options) {
        Input.call(this, options);
        this.constructor = Text;
        this.regexp = options.regexp;
        this.xmltemplate = '<text id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" regexp="${regexp}" helptext="${helptext}"/>';
        this.htmltemplate = '<input class="form-control" type="text" id="${id}" name="${name}" value="${value}">';
    }
    Text.prototype = input;
    
    /* sub-class for Text */
    function PassWord(options) {
        Input.call(this, options);
        this.constructor = PassWord;
        this.regexp = options.regexp;
        this.xmltemplate = '<password id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" regexp="${regexp}" helptext="${helptext}"/>';
        this.htmltemplate = '<input class="form-control" type="password" id="${id}" name="${name}" value="${value}">';
    }
    PassWord.prototype = input;

    /* sub-class for TextArea */
    function TextArea(options) {
        Input.call(this, options);
        this.constructor = TextArea;
        this.xmltemplate = '<textarea id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" helptext="${helptext}"/>';
        this.htmltemplate = '<textarea type="checkbox" id="${id}" name="${name}" value="${value}" rows="${size}" cols="${maxlength}"></textarea>';
    }
    TextArea.prototype = input;

    /* sub-class for Select */
    function Select(options) {
        Input.call(this, options);
        this.constructor = Select;
        this.listvalue = options.listvalue;
        this.xmltemplate = '<select id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" listvalue="${listvalue}" helptext="${helptext}"/>';
        this.htmltemplate = '<select id="${id}" name="${name}" value="${value}"></select>';
    }
    Select.prototype = input;

    /* sub-class for Date */
    function DateElement(options) {
        Input.call(this, options);
        this.constructor = DateElement;
        this.format = options.format;
        this.xmltemplate = '<date id="${id}" name="${name}" label="${label}" value="${value}" size="${size}" maxlength="${maxlength}" required="${required}" readonly="${readonly}" value="${value}" format="${format}" helptext="${helptext}"/>';
        this.htmltemplate = '<input class="form-control" type="text" id="${id}" name="${name}" value="${value}">';
    }
    DateElement.prototype = input;

    /**
     * binding plugin dynamicform into Jquery.
     * 
     * Element Factory for these lifecycle of object.
     * 
     */
    
    function UiInputDialog(_id,_type){
        this.id = _id;
        this.type = _type;
        this.name = "";
        this.label = "";
        this.size = 10;
        this.mask = "";
        this.freemask = "";
        this.regexp = "";
        this.maxlength = 10;
        this.accesskey = "";
        this.listvalue = "";
        this.helptext = "Please input promoted info";
        this.action = "";
        this.method = "post";
        this.width = 200;
        this.height = 200;
        
        this.required = false;
        this.readonly = false;  
        
        this.saveElement = function() {
            this.name = jQuery("#e_name").val();
            this.label = jQuery("#e_label").val();
            this.action = jQuery("#e_action").val();
            this.method = jQuery("#e_method").val();
            this.width = jQuery("#e_width").val();
            this.height = jQuery("#e_height").val();
            this.size = jQuery("#e_size").val();
            this.mask = jQuery("#e_mask").val();
            this.freemask = jQuery("#e_freemask").val();
            this.regexp = jQuery("#e_regexp").val();
            this.maxlength = jQuery("#e_maxlength").val();
            this.accesskey = jQuery("#e_accesskey").val();
            this.listvalue= jQuery("#e_listvalue").val();
            this.helptext = jQuery("#e_helptext").val();
            
            this.required = jQuery("#e_required")[0]?jQuery("#e_required")[0].checked:false;
            this.readonly = jQuery("#e_readonly")[0]?jQuery("#e_readonly")[0].checked:false;
        };

        this.showElement = function() {
            jQuery("#e_name").val(this.name);
            jQuery("#e_label").val(this.label);
            jQuery("#e_action").val(this.action);
            jQuery("#e_method").val(this.method);
            jQuery("#e_width").val(this.width);
            jQuery("#e_height").val(this.height);
            jQuery("#e_size").val(this.size);
            jQuery("#e_mask").val(this.mask);
            jQuery("#e_freemask").val(this.freemask);
            jQuery("#e_regexp").val(this.regexp);
            jQuery("#e_maxlength").val(this.maxlength);
            jQuery("#e_accesskey").val(this.accesskey);
            jQuery("#e_listvalue").val(this.listvalue);
            jQuery("#e_helptext").val(this.helptext);
            
            if(jQuery("#e_required")[0])
            jQuery("#e_required")[0].checked=this.required;
            if(jQuery("#e_readonly")[0])
            jQuery("#e_readonly")[0].checked=this.readonly;
        };
        this.parseFromXml = function(xmlObj){
            this.name = jQuery(xmlObj).attr("name");
            this.label = jQuery(xmlObj).attr("label");
            this.action = jQuery(xmlObj).attr("action");
            this.method = jQuery(xmlObj).attr("method");
            this.width = jQuery(xmlObj).attr("width");
            this.height = jQuery(xmlObj).attr("height");
            this.size = jQuery(xmlObj).attr("size");
            this.mask = jQuery(xmlObj).attr("mask");
            this.freemask = jQuery(xmlObj).attr("freemask");
            this.regexp = jQuery(xmlObj).attr("regexp");
            this.maxlength = jQuery(xmlObj).attr("maxlength");
            this.accesskey = jQuery(xmlObj).attr("accesskey");
            this.listvalue= jQuery(xmlObj).attr("listvalue");
            this.helptext = jQuery(xmlObj).attr("helptext");
            
            this.required = jQuery(xmlObj).attr("required");
            this.readonly = jQuery(xmlObj).attr("readonly");  
        };
    };
    
    $.dynamicplugin = {
        selected:null,
        idIndex:0,
        elementArray:{},
        createElementFactory : function(options) {
            var type = options.type;
            var instanceObj = null;
            if (type != undefined) {
                switch (type.toLowerCase()) {
                case "text":
                    instanceObj = new Text(options);
                    break;
                case "password":
                    instanceObj = new PassWord(options);
                    break;
                case "textarea":
                    instanceObj = new TextArea(options);
                    break;
                case "select":
                    instanceObj = new Select(options);
                    break;
                case "date":
                    instanceObj = new DateElement(options);
                    break;
                case "checkbox":
                    instanceObj = new Checkbox(options);
                    break;
                case "image":
                    instanceObj = new Image(options);
                    break;
                case "radio":
                    instanceObj = new Radio(options);
                    break;
                case "button":
                    instanceObj = new Button(options);
                    break;
                case "fieldset":
                    instanceObj = new FieldSet(options);
                    break;
                case "form":
                    instanceObj = new Form(options);
                    break;
                }
            }
            return instanceObj;
        },
        _toXml: function(form) {
            var stringBuffer = '<?xml version="1.0" encoding="UTF-8"?>\n';
            stringBuffer += form.toXml();
            return stringBuffer;
        },
        saveXml: function(){
            
        },
        parseXml: function(surl){
            //reset all cache data.
            this.selected=null;
            this.idIndex=0;
            this.elementArray={};
            var htmlBuffer = "";
            jQuery.ajax({
                async:false,
                type: "GET",
                url: "xml/"+surl,
                cache: false,
                dataType: "xml",
                complete : function(data, status) {
                    var pluginRef = jQuery.dynamicplugin;
                    var resp = data.responseXML;
                    
                    var form = jQuery(resp).find('tns\\:form');
                    var formId = form.attr("id");
                    var options = new UiInputDialog(formId,"form");
                    options.parseFromXml(form);
                    pluginRef.elementArray[formId] = options;
                    var createForm = pluginRef.createElementFactory(options);
                    
                    jQuery(resp).find("fieldset").each(function(){
                        var fieldSet = jQuery(this);
                        var fieldId = fieldSet.attr("id");
                        var options = new UiInputDialog(fieldId,"fieldset");
                        options.parseFromXml(fieldSet);
                        pluginRef.elementArray[fieldId] = options;
                        var createFieldSet = pluginRef.createElementFactory(options);
                        createForm.addFieldSets(createFieldSet);
                        
                        //loop element per fieldset
                        
                        jQuery(resp).find("element").each(function(){
                            var element = jQuery(this);
                            var type = element.attr("type");
                            var typeObj = element.find(type);
                            var elementId = typeObj.attr("id");
                            var options = new UiInputDialog(elementId,type);
                            options.parseFromXml(typeObj);
                            pluginRef.elementArray[elementId] = options;
                            var createElement = pluginRef.createElementFactory(options);
                            createFieldSet.addElement(createElement);
                        });
                    });
                    
                    htmlBuffer = createForm.toHtml();
                }
             });
            return htmlBuffer;
        },
        addNewElement:function(ui, dest){
            //global uuid that avoid to id conflict issue.
            this.idIndex = $.uuid();
            var _id = "el_" + this.idIndex;
            var typeToAdd = ui.draggable.attr('id');  
            typeToAdd = !typeToAdd?"text":typeToAdd.toLowerCase();
            // fetching inputs data of dialog with object instance;
            var options = new UiInputDialog(_id,typeToAdd);
            this.elementArray[_id] = options;
            
            var elementInstance = this.createElementFactory(options);
            var outputHtml = elementInstance.toHtml();
            jQuery(dest).append(outputHtml);
            
            var url = "pages/panel_dialog/input_" + typeToAdd + ".html";
            jQuery("#dialog_elt").load(url, function() {
                jQuery("#e_id").val(_id);
                if (jQuery.dynamicplugin.elementArray[_id] != null) {
                    jQuery.dynamicplugin.elementArray[_id].showElement();
                }
                jQuery(this).dialog('open');
            });
        },
        deleteElement:function(){
            if (this.selected) {
                var _no = jQuery(this.selected).attr('id');

                if (!!_no) {
                    //remove cache data from memory.
                    delete this.elementArray[_no.substring("img_".length)];
                    //remove DOM node from DOM tree of Form.
                    jQuery("#block_"+_no.substring("img_".length)).remove();
                }
            } 
        },
        initForm:function(_no){
            var form = this.elementArray[_no];
            if (form == null) {
                var options = new UiInputDialog(_no,"form");
                this.elementArray[_no] = options;
            }
        }
    };

})(jQuery);