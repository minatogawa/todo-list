Todos = new Mongo.Collection('todos');


if (Meteor.isClient) {

  Template.todos.helpers({
    'todo':function(){
      return Todos.find({}, {sort: {createdAt:-1}});
    }
  });

  Template.todoItem.events({
    'click .delete-todo':function(event){
      event.preventDefault();
      var documentId = this._id;
      var confirm = window.confirm("Delete this taks?");
        if(confirm){
          Todos.remove({_id: documentId});
        }
    },

    'keyup [name=todoTask]': function(event){
      if(event.which == 13 || event.which == 27){
        $(event.target).blur();
      } else {
          var documentId = this._id;
          var todoTask = $(event.target).val();
          Todos.update({_id: documentId}, {$set: {name: todoTask}});
          console.log("Task changed to " + todoTask);
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
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
      });
      $('[name="todoName"]').val("");
    }
  });

  Template.countingTasks.helpers({
    'totalTasks':function(){
      return Todos.find().count();
    },

    'completedTasks':function(){
      return Todos.find({completed: true}).count();
    }


  })

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}

Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home',
});
Router.configure({
  layoutTemplate: 'main',
});