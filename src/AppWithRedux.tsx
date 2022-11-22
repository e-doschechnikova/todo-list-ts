import React, {useCallback, useEffect} from "react";
import "./App.css";
import {TodoList} from "./Todolist/Todolist";
import {AddItemForm} from "./components/AddItemForm/AddItemForm";
import {AppBar, IconButton, Button, Toolbar, Typography, Container, Grid, Paper,} from "@material-ui/core";
import {Menu} from "@material-ui/icons";
import {
    ChangeTodoListFilterAC,
    FilterValuesType,
    TodoListDomainType,
    fetchTodolistsTC,
    removeTodolistTC, addTodolistTC, ChangeTodoListTitleTC
} from "./reducers/todolists-reducer";
import {addTaskTC, removeTaskTC, updateTaskTC} from "./reducers/tasks-reducer";
import {useSelector} from "react-redux";
import {AppRootStateType, useAppDispatch} from "./redux/store";
import {TaskStatuses, TaskType} from "./api/todolist-api";

export type TaskStateType = {
    [todolistID: string]: Array<TaskType>;
};

function AppWithRedux() {

    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchTodolistsTC())
    }, [])

    //BLL:
    // const todolistID_1 = v1();
    // const todolistID_2 = v1();

    const todolists = useSelector<AppRootStateType, Array<TodoListDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TaskStateType>(state => state.tasks)

    //tasks:
    const removeTask = useCallback((taskID: string, todolistID: string) => {
        dispatch(removeTaskTC(taskID, todolistID))
    }, [dispatch]);

    const addTask = useCallback((taskTitle: string, todolistID: string,) => {
        dispatch(addTaskTC(taskTitle, todolistID))
    }, [dispatch]);

    const changeTaskStatus = useCallback((taskID: string, todolistID: string, status: TaskStatuses) => {
        dispatch(updateTaskTC(taskID, todolistID, {status}))
    }, [dispatch]);

    const changeTaskTitle = useCallback((taskID: string, title: string, todolistID: string) => {
        dispatch(updateTaskTC(taskID, todolistID, {title}))
    }, [dispatch]);

    //todolists:
    const changeTodoListTitle = useCallback((title: string, todolistID: string) => {
        // debugger
        let thunk = ChangeTodoListTitleTC(title, todolistID)
        dispatch(thunk)
    }, [dispatch]);
    const changeTodoListFilter = useCallback((filter: FilterValuesType, todolistID: string) => {
        dispatch(ChangeTodoListFilterAC(todolistID, filter))
    }, [dispatch]);
    const removeTodolist = useCallback((todolistID: string) => {
        let thunk = removeTodolistTC(todolistID)
        dispatch(thunk)
    }, [dispatch]);
    const addTodolist = useCallback((title: string) => {
        let thunk = addTodolistTC(title)
        dispatch(thunk)
    }, [dispatch]);

    //UI:
    const todolistsComponents = todolists.map((tl) => {
        let allTodolistTask = tasks[tl.id]
        return (
            <Grid item key={tl.id}>
                <Paper variant={"elevation"} style={{padding: "20px"}}>
                    <TodoList
                        id={tl.id}
                        title={tl.title}
                        tasks={allTodolistTask}
                        filter={tl.filter}
                        addTask={addTask}
                        removeTask={removeTask}
                        removeTodolist={removeTodolist}
                        changeTaskStatus={changeTaskStatus}
                        changeTodoListFilter={changeTodoListFilter}
                        changeTaskTitle={changeTaskTitle}
                        changeTodoListTitle={changeTodoListTitle}
                    />
                </Paper>
            </Grid>
        );
    });

    //UI:
    return (
        <div className="App">
            <AppBar position={"static"} color={"transparent"}>
                <Toolbar style={{justifyContent: "space-between"}}>
                    <IconButton edge={"start"} color={"secondary"} aria-label={"menu"}>
                        <Menu/>
                    </IconButton>
                    <Typography variant="h5">Todolists</Typography>
                    <Button color={"secondary"} variant={"outlined"}>
                        Login
                    </Button>
                </Toolbar>
            </AppBar>
            <Container fixed>
                <Grid container style={{padding: "20px 0"}}>
                    <AddItemForm addItem={addTodolist}/>
                </Grid>
                <Grid container spacing={4}>
                    {todolistsComponents}
                </Grid>
            </Container>
        </div>
    );
}

export default AppWithRedux;
