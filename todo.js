$(document).ready(function() {
    var todo_page = {
        page_title: 'All TODO\'s',
        right_button_label: "New",
        right_button_action: function() {
            show_page(new_todo_page);
        },
        create_page_elements: function() {
            var todos = $("<ul></ul>");
            todos.append("<li><input type='checkbox' /> TODO</li>")
            return todos;
        }
    };
    
    var new_todo_page = {
        prev_page: todo_page,
        page_title: 'New TODO',
        create_page_elements: function() {
            var form = $("<div></div>");
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
    }
    
    show_page(todo_page);
});