import {AddTodoListAT, RemoveTodoListAT, SetTodoListAT} from "./todolists-reducer";
import {CreateTaskType, TaskType, todolistAPI, UpdateTasksModelType} from "../api/todolist-api";
import {Dispatch} from "redux";
import {AppRootStateType} from "../redux/store";

const initialState: TaskStateType = {}

export const tasksReducer = (
    state = initialState,
    action: ActionsType
): TaskStateType => {
    switch (action.type) {
        case "REMOVE-TASK":
            return {
                ...state,
                [action.todolistID]: state[action.todolistID].filter(task => task.id !== action.taskID)
            }
        case "ADD-TASK": {
            return {
                ...state,
                [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]
            } as TaskStateType
        }
        case "UPDATE-TASK":
            return {
                ...state,
                [action.todolistID]: state[action.todolistID].map(task => task.id === action.taskID ? {
                    ...task,
                    ...action.model
                } : task)
            }
        case "ADD-TODOLIST": {
            return {...state, [action.todolist.id]: []}
        }
        case "REMOVE-TODOLIST":
            let copyState = {...state}
            delete copyState[action.id]
            return copyState
        case "SET-TASK":
            return {...state, [action.todolistID]: action.tasks}
        case "SET-TODOLISTS": {
            const stateCopy = {...state}
            action.todolists.forEach((tl) => {
                stateCopy[tl.id] = []
            })
            return stateCopy;
        }
        default:
            return state
    }
}

///----------- action creators -----------\\\
export const removeTaskAC = (taskID: string, todolistID: string) => ({
    type: "REMOVE-TASK",
    taskID,
    todolistID
} as const);
export const addTaskAC = (task: CreateTaskType) => ({type: "ADD-TASK", task} as const);
export const updateTaskAC = (taskID: string, model: UpdateDomainTasksModelType, todolistID: string) => ({
    type: "UPDATE-TASK",
    taskID,
    model,
    todolistID
} as const);
export const setTaskAC = (tasks: TaskType[], todolistID: string) => ({type: "SET-TASK", tasks, todolistID} as const)

///----------- thunks creators -----------\\\
export const fetchTasksTC = (todolistID: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistAPI.getTasks(todolistID)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTaskAC(tasks, todolistID))
        })
}
export const removeTaskTC = (taskID: string, todolistID: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistAPI.deleteTasks(taskID, todolistID).then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(removeTaskAC(taskID, todolistID))
        }
    })
}
export const addTaskTC = (taskTitle: string, todolistID: string) => (dispatch: Dispatch<ActionsType>) => {
    todolistAPI.createTasks(todolistID, taskTitle).then((res) => {
        dispatch(addTaskAC(res.data.data.item))
    })
}
export const updateTaskTC = (taskID: string, todolistID: string, domainModel: UpdateDomainTasksModelType) => (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistID].find((t) => t.id === taskID)
    if (task) {
        const apiModel: UpdateTasksModelType = {
            title: task.title,
            deadline: task.deadline,
            startDate: task.startDate,
            description: task.description,
            priority: task.priority,
            status: task.status,
            ...domainModel

        }
        todolistAPI.updateTasks(todolistID, taskID, apiModel).then((res) => {
            dispatch(updateTaskAC(taskID, domainModel, todolistID))
        })
    }
}

///----------- types -----------\\\
export type TaskStateType = {
    [todolistID: string]: Array<TaskType>;
};
type ActionsType =
    ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodoListAT
    | RemoveTodoListAT
    | SetTodoListAT
    | ReturnType<typeof setTaskAC>

export type UpdateDomainTasksModelType = {
    title?: string
    description?: string
    status?: number
    priority?: number
    startDate?: string
    deadline?: string
}


