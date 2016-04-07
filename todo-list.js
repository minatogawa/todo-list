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
              Todos.remove({_id: documentId});
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
      } else {
          var documentId = this._id;
          var todoTask = $(event.target).val();
          Todos.update({_id: documentId}, {$set: {name: todoTask}});
          Bert.alert({
            title: 'Atualização',
            message: 'Tarefa atualizada com sucesso',
            type: 'success',
            style: 'fixed-top',
            icon: 'fa-check'
          });
        }  
    },

    'change [type=checkbox]': function(){
      var documentId = this._id;
      var isCompleted = this.completed;
      if(isCompleted == false){
          Todos.update({ _id: documentId }, {$set: { completed: true}});
      } else {
          Todos.update({_id:documentId}, {$set: {completed:false}});
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
      var currentUser = Meteor.userId();
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
        createdBy: currentUser,
        listId: currentList,
      });
      $('[name="todoName"]').val("");
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
      var currentUser = Meteor.userId();
      Lists.insert({
        name: listName,
        createdBy: currentUser
      }, function(error, results){
            Router.go('listPage', {_id: results});
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.events({
    'click .delete-list':function(event){
      event.preventDefault();
      var currentList = this._id;
      var confirm = window.confirm("Delete this list?");
        if(confirm){
          Lists.remove({_id: currentList});
        }
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