$(document).ready(function() {
    /* model */
    var todos = [];
    function add_todo(text) {
        todos.push(text);
    }
    /* end model */
    
    var todo_page = {
        page_title: 'TODO',
        right_button_label: "New",
        right_button_action: function() {
            show_page(new_todo_page);
        },
        create_page_elements: function() {
            var page = $("<ul></ul>");
            for ( var i = 0; i < todos.length; i++ ) {
                var li = $("<li></li>").text(todos[i]);
                li.prepend("<input type='checkbox' /> ");
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
    
    function show_page(page) {
        var prev_page = current_page;
        var prev_page_elements = current_page_elements;
        
        current_page = page;
        current_page_elements=current_page.create_page_elements();
        
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