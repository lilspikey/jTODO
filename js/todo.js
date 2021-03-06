$(document).ready(function() {
    /* model */
    if ( !window.openDatabase ) {
        $('#toolbar').after(
            $("<div></div>")
                .attr('selected', true)
                .text("sorry this browser does not support offline databases")
        );
        return;
    }
    var db = openDatabase('jTODO', '1.0' /*version*/, 'jTODO', 65536 /*max size*/);
    db.transaction(function (tx) {
        // initialise database
        tx.executeSql('CREATE TABLE todo (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL DEFAULT "", todo_order INTEGER NOT NULL DEFAULT 0, done INTEGER NOT NULL DEFAULT 0 );');
    });
    
    function read_todos(callback) {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM todo ORDER BY todo_order ASC', [],
                function(tx, results) {
                    callback(results.rows);
                });
        });
    }
    
    function add_todo(description, callback) {
        db.transaction(function(tx) {
            tx.executeSql('SELECT MAX(todo_order) AS next_order FROM todo', [],
                function(tx,results) {
                    var order = results.rows.item(0)['next_order'] + 1;
                    tx.executeSql('INSERT INTO todo (description,todo_order) VALUES(?,?)', [description,order],
                        function(tx,results) {
                            callback(results.insertId);
                        });
                }
            );
        });
    }
    function get_todo(id, callback) {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM todo WHERE id = ?', [id],
                function(tx, results) {
                    var rows = results.rows;
                    var todo = (rows.length > 0)? rows.item(0) : null;
                    callback(todo);
                });
        });
    }
    function set_todo_text(id, description, callback) {
        db.transaction(function(tx) {
            tx.executeSql('UPDATE todo SET description=? WHERE id=?', [description,id],
                function(tx,results) {
                    callback();
                }
            );
        });
    }
    function set_todo_done(id, done, callback) {
        db.transaction(function(tx) {
            tx.executeSql('UPDATE todo SET done=? WHERE id=?', [done,id],
                function(tx,results) {
                    callback();
                }
            );
        });
    }
    function delete_todo(id, callback) {
        db.transaction(function(tx) {
            tx.executeSql('DELETE FROM todo WHERE id=?', [id],
                function(tx,results) {
                    callback();
                }
            );
        });
    }
    /* end model */
    
    /* touch handlers */
    function handleTouchEvent(event) {
        /* from http://jasonkuhn.net/mobile/jqui/js/jquery.iphoneui.js
         but changed a bit*/
        
        var touches = event.changedTouches;
        var first = touches[0];
        var type = '';
        
        
        // only want to do this for the drag handles
        if ( !first.target || !first.target.className || first.target.className.indexOf("handle") == -1 ) {
            return;
        }
        
        switch(event.type) {
            case 'touchstart':
                type = 'mousedown';
                break;
                
            case 'touchmove':
                type = 'mousemove';
                break;        
                
            case 'touchend':
                type = 'mouseup';
                break;
            
            default:
                return;
        }
        
        var simulatedEvent = document.createEvent('MouseEvent');
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
        
        first.target.dispatchEvent(simulatedEvent);
        
        if ( event.type == 'touchmove' ) {
            event.preventDefault();
        }
    }
    document.addEventListener("touchstart", handleTouchEvent, false);
    document.addEventListener("touchmove", handleTouchEvent, false);
    document.addEventListener("touchend", handleTouchEvent, false);
    /* end touch handlers */
    
    function add_todo_handlers(li, id) {
        li.find('button.view_todo').click(function(event) {
            event.preventDefault();
            get_todo(id, function(todo) {
                show_page(edit_todo_page, { todo: todo });
            });
        });
        
        function mark_done() {
            var done = li.find(':input[type=checkbox]').attr('checked')? 1 : 0;
            set_todo_done(id, done, function() {
                $('#todo_' + id).toggleClass('done', done);
            });
        }
        
        li.change(function(event) {
            mark_done();
        });
        
        
        li.find('button.delete').click(function(event) {
            event.stopPropagation();
            li.toggleClass('deleting');
        });
        
        li.find('button.delete_confirm').click(function(event) {
            event.stopPropagation();
            delete_todo(id, function() {
                li.remove();
            });
        });
        
    }
    
    var todo_page = {
        goto_page: goto_todo_page,
        
        page_title: 'TODO',
        right_button_label: "New",
        right_button_action: function() {
            show_page(new_todo_page);
        },
        left_button_label: "Edit",
        left_button_action: goto_edit_all_page,
        create_page_elements: function(args) {
            var page = $("<ul></ul>");
            var todos = args.todos;
            for ( var i = 0; i < todos.length; i++ ) {
                var todo = todos.item(i);
                var li = $("<li class='todo_item'></li>")
                    .attr('id', 'todo_' + todo.id)
                        .append("<button class='delete'><span>x</span></button>")
                        .append("<button class='delete_confirm'>Delete</button>")
                        .append("<button class='view_todo'><span>&gt;</spa></button>")
                        .append("<div class='handle'><span>=</spa></div>")
                        .append("<input type='checkbox' /> ")
                        .append($("<label></label>").text(todo.description)
                );
                
                if ( todo.done ) {
                    li.addClass('done');
                    li.find(':input[type=checkbox]').attr('checked', 'checked');
                }
                
                add_todo_handlers(li, todo.id);
                
                var todo_id = 'todo_checkbox_'+todo.id;
                li.find(':input[type=checkbox]').attr('id', todo_id);
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
                    add_todo(todo, function(todo_id) {
                        goto_todo_page();
                    });
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
            var id = args.todo.id;
            var description = args.todo.description;
            
            var form = $("<form class='edit_todo_page panel'>" +
                         "<fieldset>" +
                         "<div class='row'>" +
                         "<label for='todo_entry'>TODO: </label>" +
                         "<input type='text' id='todo_entry' name='todo_entry' />" +
                         "</div>" +
                         "</fieldset>" +
                         "</form>");
            
            form.find(':input[name=todo_entry]').val(description);
            
            form.submit(function(event) {
                event.preventDefault();
                var todo = form.find(':input[name=todo_entry]').val();
                if ( todo ) {
                    set_todo_text(id, todo, function() {
                        goto_todo_page();
                    });
                }
            });
            
            return form;
        }
    };
    
    var edit_all_page = {
        page_title: todo_page.page_title,
        right_button_label: todo_page.right_button_label,
        right_button_action: todo_page.right_button_action,
        left_button_label: "Done",
        left_button_action: goto_todo_page,
        create_page_elements: function(args) {
            var page = todo_page.create_page_elements(args).addClass('edit');
            /*page.find('.handle')
            .bind("touchstart", function(event) {
                $('h1').text('start');
                //alert("here");
                $(event.target).trigger('mousedown', event);
                
                event.preventDefault();
            })
            .bind("touchmove", function(event) {
                $('h1').text('move');
                //alert("here");
                $(event.target).trigger('mousemove', event);
                event.preventDefault();
            })
            .bind("touchend", function(event) {
                $('h1').text('end');
                //alert("here");
                $(event.target).trigger('mouseup', event);
                event.preventDefault();
            })
            .bind("mousemove", function() {
                alert("here");
            });*/
            
            page.sortable({
                axis: 'y',
                handle: '.handle',
                update: function(){
                    db.transaction(function(tx) {
                        $('.todo_item').each(function(i,item) {
                            var id = $(item).find(':input[type=checkbox]').attr('id');
                            id = Number(id.substring('todo_checkbox_'.length));
                            tx.executeSql('UPDATE todo SET todo_order=? WHERE id=?', [i, id]);
                        });
                    });
                }
            });
            return page;
        }
    };
    
    var toolbar = $('#toolbar');
    var current_page = null;
    var current_page_elements = null;
    
    var left_button = toolbar.find('a#leftButton');
    left_button.hide();
    left_button.click(function(event) {
        event.preventDefault();
        if ( current_page && current_page.left_button_action ) {
            current_page.left_button_action();
        }
    });
    
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
            current_page.prev_page.goto_page();
        }
    });
    
    function show_page(page, args) {
        var prev_page = current_page;
        var prev_page_elements = current_page_elements;
        
        current_page = page;
        current_page_elements=current_page.create_page_elements(args);

        if ( prev_page ) {
            prev_page_elements.remove();
        }
        
        current_page_elements.attr('selected',true);
        toolbar.after(current_page_elements);
        toolbar.find('h1').text(current_page.page_title);
        
        if ( current_page.left_button_label ) {
            left_button.text(current_page.left_button_label);
            left_button.show();
        }
        else {
            left_button.hide();
            left_button.text("");
        }
        
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
    
    function goto_todo_page() {
        read_todos(function(todos) {
            show_page(todo_page, { todos: todos });
        });
    }
    
    function goto_edit_all_page() {
        read_todos(function(todos) {
            show_page(edit_all_page, { todos: todos });
        });
    }
    
    goto_todo_page();
});
