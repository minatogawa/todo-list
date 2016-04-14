Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');


if (Meteor.isClient) {

  /*Meteor.subscribe('lists');*/
  // Meteor.subscribe('todos');

  Template.todos.helpers({
    'todo':function(){
      var currentUser = Meteor.userId();
      var currentList = this._id;
      return Todos.find({createdBy:currentUser, listId:currentList}, {sort: {createdAt:-1}});
    }
  });

  Template.todoItem.events({
    'click .delete-todo':function(event){
      event.preventDefault();
      var documentId = this._id;
        new Confirmation({
          message: "Are you sure ?",
          title: "Confirmation",
          cancelText: "Cancel",
          okText: "Ok",
          success: true // wether the button should be green or red
        }, function (ok) {
          // ok is true if the user clicked on "ok", false otherwise
            if(ok){
              // Todos.remove({_id: documentId});
              Meteor.call('removeListItem', documentId);
              Bert.alert({
                title: 'Delete',
                message: 'Tarefa removida com sucesso',
                type: 'danger',
                style: 'fixed-top',
                icon: 'fa-remove'
              });
            }
          }
        );
    },  

    'keyup [name=todoTask]': function(event){
      if(event.which == 13 || event.which == 27){
        $(event.target).blur();
        Bert.alert({
            title: 'Atualização',
            message: 'Tarefa atualizada com sucesso',
            type: 'success',
            style: 'fixed-top',
            icon: 'fa-check'
          });
      } else {
          var documentId = this._id;
          var todoTask = $(event.target).val();
          Meteor.call('updateListItem', documentId, todoTask);
          // Todos.update({_id: documentId}, {$set: {name: todoTask}}); 
        }  
    },

    'change [type=checkbox]': function(){
      var documentId = this._id;
      var isCompleted = this.completed;
      if(isCompleted == false){
        Meteor.call('changeItemStatus', documentId, true);
          // Todos.update({ _id: documentId}, {$set: { completed: true}});
      } else {
        Meteor.call('changeItemStatus', documentId, false);
          // Todos.update({_id:documentId}, {$set: {completed:false}});
        }
    },
  });

  Template.todoItem.helpers({
    'checked':function(){
      var isCompleted = this.completed;
      if(isCompleted == true){
          return "checked";
      } else {
          return "";
        }
    },
  });

  Template.addTodo.events({
    'submit form':function(event) {
      event.preventDefault();
      var todoName = $('[name="todoName"]').val();
      var currentList = this._id;
      Meteor.call('createListItem', todoName, currentList, function(error){
        if(error){
          console.log(error.reason);
        } else {
            $('[name="todoName"]').val("");  
          }
      })
      // var currentUser = Meteor.userId();
      // Todos.insert({
      //   name: todoName,
      //   completed: false,
      //   createdAt: new Date(),
      //   createdBy: currentUser,
      //   listId: currentList,
      // }); 
    }
  });

  Template.countingTasks.helpers({
    'totalTasks':function(){
      var currentList = this._id;
      return Todos.find({listId: currentList}).count();
    },
    'completedTasks':function(){
      var currentList = this._id;
      return Todos.find({listId: currentList, completed: true}).count();
    }
  });

  Template.addList.events({
    'submit form':function(event){
      event.preventDefault();
      var listName = $('[name=listName]').val();
      Meteor.call('createNewList', listName, function(error, results){
        if(error){
          console.log(error.reason);
        } else {
            Router.go('listPage', {_id:results});
            $('[name=listName]').val('');
          }
      });
      // var currentUser = Meteor.userId();
      // Lists.insert({
      //   name: listName,
      //   createdBy: currentUser
      // }, function(error, results){
      //       Router.go('listPage', {_id: results});
      // });
      // $('[name=listName]').val('');
    }
  });

  Template.lists.events({
    'click .delete-list':function(event){
      event.preventDefault();
      var currentList = this._id;
      var confirm = window.confirm("Delete this list?");
        if(confirm){
          Meteor.call('removeList', currentList)
        }
      // var currentList = this._id;
      // var confirm = window.confirm("Delete this list?");
      //   if(confirm){
      //     Lists.remove({_id: currentList});
      //   }
    },
  });

  Template.lists.helpers({
    'list':function(){
      var currentUser = Meteor.userId();
      return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
    }
  });

  Template.lists.onCreated(function(){
    this.subscribe('lists');
  });

  Template.register.events({
    'submit form':function(event){
      event.preventDefault();
      // var email = $('[name=email]').val();
      // var password = $('[name=password]').val();
      // Accounts.createUser({
        // email: email,
        // password: password
      // },  function(error){
          // if(error){
            // console.log(error.reason);
          // } else{
              // Router.go('home');
            // }
        // }
      // );
    },
  });

  Template.navigation.events({
    'click .logout':function(event) {
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.events({
    'submit form':function(){
      event.preventDefault();
      // var email = $('[name=email').val();
      // var password = $('[name=password]').val();
      // Meteor.loginWithPassword(email, password, function(error){
        // if(error){
          // console.log(error.reason);
        // } else {
           // Router.go('home');
          // }  
      // });
    }
  });

  $.validator.setDefaults({
    rules:{
      email:{
        required:true,
        email:true,
      },
      password:{
        required:true,
        minlength:6,
      },
    },
    messages:{
      email:{
        required: "Insira um e-mail.",
        email: "Insira um e-mail válido.",
      },
      password:{
        required: "Insira uma senha.",
        minlength: "Insira uma senha com no mínimo {0} caracteres.",
      },
    },
  });

  Template.login.onCreated(function(){
    console.log("template created");
  });

  Template.login.onRendered(function(){
    var validator =$('.login').validate({
      submitHandler:function(event){
        var email = $('[name=email').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
          if(error){
            if(error.reason == "User not found"){
              validator.showErrors({
                email:error.reason
              });
            } if (error.reason == "Incorrect password"){
                validator.showErrors({
                  password:error.reason
                });  
              }
          } else {
              Router.go('home');
            }  
       });
      }
    });
  });

  Template.login.onDestroyed(function(){
    console.log("template destroyed");
  });

  Template.register.onRendered(function(){
   var validator = $('.register').validate({
      submitHandler:function(event){
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
          email: email,
          password: password
        }, function(error){
            if(error){
              if(error.reason == "Email already exists."){
                validator.showErrors({
                  email:error.reason
                });
              }
            } else{
               Router.go('home');
              }
           }
        );
      }
    });
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
  Meteor.publish('lists', function(){
    var currentUser = this.userId;
    return Lists.find({createdBy:currentUser});
  });

  Meteor.publish('todos', function(currentList){
    var currentUser = this.userId;
    return Todos.find({createdBy:currentUser, listId:currentList});
  });

  Meteor.methods({
    'createNewList': function(listName){
      check(listName, String);
      if(listName==""){
        listName = "Untitled";
      };
        var currentUser = Meteor.userId();
        var data = {
            name: listName,
            createdBy: currentUser
        }
        if(!currentUser){
            throw new Meteor.Error("not-logged-in", "You're not logged-in.");
        }
        return Lists.insert(data);
    },

    'removeList':function(currentList){
      var currentUser = Meteor.userId();
      var data = {
        _id:currentList,
        createdBy:currentUser,
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You are not logged in");
      }
      Lists.remove(data);
    },

    'createListItem':function(todoName, currentList){
      check(todoName, String);
      check(currentList, String);
      if(todoName==""){
        todoName = "Untitled";
      };
      var currentUser = Meteor.userId();
      var data = {
        name: todoName,
        completed: false,
        createdAt: new Date(),
        createdBy: currentUser,
        listId: currentList,
      }
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You are not logged in");
      }
      var currentList = Lists.findOne(currentList);
      if(currentList.createdBy != currentUser){
        throw new Meteor.Error("invalid-user", "You don't own that list");
      };

      return Todos.insert(data);
    },

    'removeListItem':function(documentId){
      var currentUser = Meteor.userId();
      var data = {
        _id: documentId,
        createdBy: currentUser,
      };
      if(!currentUser){
        throw new Meteor.Error ("you-are-not-logged-in", "You are not logged in.");
      }
      Todos.remove(data);
    },
    'updateListItem':function(documentId, todoTask){
      check(todoTask, String);
      var currentUser = Meteor.userId();
      var data = {
        _id: documentId, 
        createdBy:currentUser
      };
      if(!currentUser){
        throw new Meteor.Error("not-logged-in", "You are not logged in")
      }
      Todos.update(data, {$set: {name: todoTask}});
    },
    'changeItemStatus':function(documentId, status){
      check(status, Boolean);
      var currentUser = Meteor.userId();
      var data = {
        _id:documentId,
        createdBy: currentUser,
      };
      if(!currentUser){
        throw new Meteor.Error("you-are-not-logged-in", "You are not logged in");
      }
      Todos.update(data, {$set: { completed: status}});
    }


  });

}

Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home',
  waitOn: function(){
    return Meteor.subscribe('lists');
  }
});
Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading',
});
Router.route('/list/:_id', {
  name: 'listPage',
  template:'listPage',
  data: function(){
    var currentList = this.params._id;
    var currentUser = Meteor.userId();
    return Lists.findOne({_id: currentList, createdBy: currentUser});
  },
  onBeforeAction:function(){
    var currentUser = Meteor.userId();
    if(currentUser){
      this.next();
    } else {
        this.render('login');
      }
  },
  waitOn:function(){
    var currentList = this.params._id;
    return Meteor.subscribe('todos', currentList);
  }
});