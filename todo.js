$(document).ready(function() {
    /* model */
    var todos = [];
    function add_todo(text) {
        todos.push(text);
    }
    function get_todo_text(id) {
        return todos[id];
    }
    function set_todo_text(id, text) {
        todos[id]=text;
    }
    /* end model */
    
    function add_todo_handlers(li, id) {
        li.click(function(event) {
            event.preventDefault();
            show_page(edit_todo_page, { id: id });
        });
        li.find(':input[type=checkbox], label').click(function(event) {
            event.stopPropagation();
        });
    }
    
    var todo_page = {
        page_title: 'TODO',
        right_button_label: "New",
        right_button_action: function() {
            show_page(new_todo_page);
        },
        create_page_elements: function() {
            var page = $("<ul></ul>");
            for ( var i = 0; i < todos.length; i++ ) {
                var li = $("<li class='todo_item'></li>")
                    .append($("<a></a>")
                        .append("<input type='checkbox' /> ")
                        .append($("<label></label>").text(todos[i])
                    )
                );
                
                add_todo_handlers(li, i);
                
                var todo_id = 'todo_checkbox_'+i;
                li.find(':input').attr('id', todo_id);
                li.find('label').attr('for', todo_id);
                
                page.append(li);
            }
            
            return page;
        }
    };
    
    var new_todo_page = {
        prev_page: todo_page,
        page_title: 'New TODO',
        right_button_label: "Add",
        right_button_style: 'blue',
        right_button_action: function() {
            $('form.new_todo_page').submit();
        },
        create_page_elements: function() {
            var form = $("<form class='new_todo_page panel'>" +
                         "<fieldset>" +
                         "<div class='row'>" +
                         "<label for='todo_entry'>TODO: </label>" +
                         "<input type='text' id='todo_entry' name='todo_entry' />" +
                         "</div>" +
                         "</fieldset>" +
                         "</form>");
            
            form.submit(function(event) {
                event.preventDefault();
                var todo = form.find(':input[name=todo_entry]').val();
                if ( todo ) {
                    add_todo(todo);
                    show_page(todo_page);
                }
            });
            
            return form;
        }
    };
    
    var edit_todo_page = {
        prev_page: todo_page,
        page_title: 'Edit TODO',
        right_button_label: "Save",
        right_button_style: 'blue',
        right_button_action: function() {
            $('form.edit_todo_page').submit();
        },
        create_page_elements: function(args) {
            var id = args.id;
            
            var form = $("<form class='edit_todo_page panel'>" +
                         "<fieldset>" +
                         "<div class='row'>" +
                         "<label for='todo_entry'>TODO: </label>" +
                         "<input type='text' id='todo_entry' name='todo_entry' />" +
                         "</div>" +
                         "</fieldset>" +
                         "</form>");
            
            form.find(':input[name=todo_entry]').val(get_todo_text(id));
            
            form.submit(function(event) {
                event.preventDefault();
                var todo = form.find(':input[name=todo_entry]').val();
                if ( todo ) {
                    set_todo_text(id, todo);
                    show_page(todo_page);
                }
            });
            
            return form;
        }
    };
    
    var toolbar = $('#toolbar');
    var current_page = null;
    var current_page_elements = null;
    
    var right_button = toolbar.find('a#rightButton');
    right_button.click(function(event) {
        event.preventDefault();
        if ( current_page && current_page.right_button_action ) {
            current_page.right_button_action();
        }
    });
    
    var back_button = toolbar.find('a#backButton');
    back_button.click(function(event) {
        event.preventDefault();
        if ( current_page && current_page.prev_page ) {
            show_page(current_page.prev_page);
        }
    });
    
    function show_page(page, args) {
        var prev_page = current_page;
        var prev_page_elements = current_page_elements;
        
        current_page = page;
        current_page_elements=current_page.create_page_elements(args);
        
        // TODO remove old page etc
        if ( prev_page ) {
            prev_page_elements.remove();
        }
        
        current_page_elements.attr('selected',true);
        toolbar.after(current_page_elements);
        toolbar.find('h1').text(current_page.page_title);
        
        if ( current_page.right_button_label ) {
            right_button.text(current_page.right_button_label);
            right_button.removeClass('blueButton');
            if ( current_page.right_button_style == 'blue' ) {
                right_button.addClass('blueButton');
            }
            right_button.show();
        }
        else {
            right_button.hide();
            right_button.text("");
        }
        
        if ( current_page.prev_page ) {
            back_button.text(current_page.prev_page.page_title);
            back_button.show();
        }
        else {
            back_button.hide();
            back_button.text("");
        }
        
        // set focus to first field in any form
        current_page_elements.find(':input[type=text]:first').focus();
    }
    
    show_page(todo_page);
});