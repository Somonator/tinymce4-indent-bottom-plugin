tinymce.PluginManager.add('indent_bottom', function(editor, url) {
    function change_indent_bottom(method, val) {
        tinymce.activeEditor.undoManager.transact(function () {
            tinymce.activeEditor.focus();
            tinymce.activeEditor.formatter[method]('indent_bottom', {value: val}, null, true);
            tinymce.activeEditor.nodeChanged();
        });
    }
    
    function get_current_value() {
        return new Promise(function(resolve, reject) {
            tinymce.activeEditor.dom.getParents(tinymce.activeEditor.selection.getStart(), function (elm) {
                resolve(elm.style.marginBottom.slice(0,-2));          
            });  
        })
    }

    async function open_enter_window() {
        editor.windowManager.open({
            title: 'Insert the number',
            body: [{
                type: 'textbox',
                subtype: 'number',
                name: 'source',
                label: '',
                value: await get_current_value()
            }],
            onsubmit: function(e) {
                change_indent_bottom('apply', e.data.source + 'px');
            }
        });
    }

    let button_text = 'Indent bottom';

    editor.addButton('indent_bottom', {
        text: button_text,        
        type: 'menubutton',
        icon: false,
        menu: [5, 10, 15, 20, 30, 40, 50, 'enter', 'clear'].map(function(val) {
            let item = {};

            if (typeof val === 'number') {
                item.text = val + 'px';
                item.onclick = function() {
                    change_indent_bottom('apply', val + 'px');
                    return false;
                };
            }

            if (val === 'enter') {
                item.text = 'Your number';
                item.onclick = function() {
                    open_enter_window();
                    return false;
                };
            }
                
            if (val === 'clear') {
                item.text = 'Remove indent'; 
                item.onclick = function() {
                    change_indent_bottom('remove', null);
                    return false;
                };
            }

            return item;
        }),
        onPostRender: function() {
            let _this = this;

            editor.on('NodeChange', async function(e) {
                let val = await get_current_value(),
                    new_button_text = button_text + (val ? ' (' + val + 'px)' : '');

                _this.getEl().querySelector('span').innerHTML = new_button_text;
            })
        }
    });

    editor.on('init', function(e) {
        tinymce.get(editor.id).formatter.register('indent_bottom', {
            selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
            styles: {
                marginBottom: '%value'
            },
            remove_similar: true      
        });              
    });
});