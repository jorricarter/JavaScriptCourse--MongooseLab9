//these are to tell the page where to find things
var express = require('express');
var router = express.Router();
var Task = require('../models/task');

//displays all tasks marked as "complete=false" on homepage as 'incomplete tasks'.
/* GET home page with all incomplete tasks */
router.get('/', function(req, res, next) {
console.log('test');
  Task.find( {completed: false})
    .then( (docs) => {
      res.render('index', {title: 'Incomplete Tasks', tasks: docs})
    }).catch( (err) => {
    next(err);
  });

});

/* GET details about one task */
router.get('/task/:_id', function(req, res, next) {

//find the specified task (if it exists)

    Task.findOne({_id: req.params._id} )
            .then( (task) => {
                if (task) {
                    res.render('task', {title: 'Task', task: task});
                } else {
                    res.status(404).send('Task not found');
                }
            })
            .catch((err) => {
                next(err);
            })
});

//this is to display all completed tasks on the tasks_completed page.
/* GET completed tasks */
router.get('/completed', function(req, res, next){

  Task.find( {completed:true} )
    .then( (docs) => {
      res.render('tasks_completed', { title: 'Completed tasks' , tasks: docs });
    }).catch( (err) => {
    next(err);
  });

});

//this is so the page knows how to add tasks
/* POST new task */
router.post('/add', function(req, res, next){

  if (!req.body || !req.body.text) {
    //no task text info, redirect to home page with flash message
    req.flash('error', 'please enter a task');
    res.redirect('/');
  }

  else {

    // Insert into database. New tasks are assumed to be not completed.

    // Create a new Task, an instance of the Task schema, and call save()
      new Task( { text: req.body.text, completed: false, dateCreated: new Date(), dateCompleted: new Date} ).save()
          .then((newTask) => {
              console.log('The new task created is: ', newTask);
              res.redirect('/');
          })
          .catch((err) => {
              next(err);   // most likely to be a database error.
          });
  }

});

//this is to change a task from {completed=true} to {completed=false}.
//this way, it stops showing up on the incomplete page and starts showing up on the 'completed' page.
/* POST task done */
router.post('/done', function(req, res, next) {

    Task.findOneAndUpdate( {_id: req.body._id}, {$set: {completed: true}}, {$set: {dateCompleted: new Date()}} )
        .then((updatedTask) => {
            if (updatedTask) {   // updatedTask is the document *before* the update
                res.redirect('/')  // One thing was updated. Redirect to home
            } else {
                // if no updatedTask, then no matching document was found to update. 404
                res.status(404).send("Error marking task done: not found");
            }
        }).catch((err) => {
        next(err);
    })

});

//tells the page how to find and modify all tasks to be marked as completed
/* POST all tasks done */
router.post('/alldone', function(req, res, next) {

    Task.updateMany( { completed : false } , { $set : { completed : true} } )
        .then( (result) => {
            console.log("How many documents were modified? ", result.n);
            req.flash('info', 'All tasks marked as done!');
            res.redirect('/');
        })
        .catch( (err) => {
            next(err);
        })

});

// copied from 'router.post(/alldone)'
/* POST delete all completed tasks */
router.post('/deleteDone', function(req, res, next) {

    Task.deleteMany( { completed : true } )
        .then( (result) => {
            console.log("How many documents were modified? ", result.n);
            req.flash('info', 'All completed tasks deleted!');
            res.redirect('/');
        })
        .catch( (err) => {
            next(err);
        })

});

/* POST task delete */
router.post('/delete', function(req, res, next){
//in tasks.delete(if id matches this id)
    Task.deleteOne( { _id : req.body._id } )
        .then( (result) => {
//if something was deleted, redirect to page.
            if (result.deletedCount === 1) {  // one task document deleted
                res.redirect('/');
//if nothing was found to delete, notify user of error.
            } else {
                // The task was not found. Report 404 error.
                res.status(404).send('Error deleting task: not found');
            }
        })
        .catch((err) => {

            next(err);   // Will handle invalid ObjectIDs or DB errors.
        });
});


module.exports = router;


