Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');


if (Meteor.isClient) {

  Template.todos.helpers({
    'todo':function(){
      var currentList = this._id;
      return Todos.find({listId:currentList}, {sort: {createdAt:-1}});
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
      var currentList = this._id;
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
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
      Lists.insert({
        name: listName
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
      return Lists.find({}, {sort: {name: 1}});
    }
  });


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
Router.route('/list/:_id', {
  name: 'listPage',
  template:'listPage',
  data: function(){
    var currentList = this.params._id;
    return Lists.findOne({_id: currentList});
  }
});