import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Firebase Realtime Database URL
const appSettings = {
    databaseURL: "https://productivity-app-b9f35-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const toDoListInDB = ref(database, "toDoList")
const completedListInDB = ref(database, "completedList")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const toDoListEl = document.getElementById("to-do-list")
const completedListEl = document.getElementById("completed-list")

addButtonEl.addEventListener("click", function () {
    const inputValue = inputFieldEl.value.trim()
    if (inputValue !== "") {
        push(toDoListInDB, inputValue)
        inputFieldEl.value = ""
    }
})

onValue(toDoListInDB, function (snapshot) {
    toDoListEl.innerHTML = ""
    if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(item => {
            appendItemToToDoListEl(item)
        })
    } else {
        toDoListEl.innerHTML = "<li>No tasks yet</li>"
    }
})

onValue(completedListInDB, function (snapshot) {
    completedListEl.innerHTML = ""
    if (snapshot.exists()) {
        Object.entries(snapshot.val()).forEach(item => {
            appendItemToCompletedListEl(item)
        })
    }
})

function appendItemToToDoListEl([itemID, itemValue]) {
    const li = document.createElement("li")
    li.textContent = itemValue

    const btnContainer = document.createElement("div")
    btnContainer.style.marginTop = "10px"

    // Edit Button
    const editBtn = document.createElement("button")
    editBtn.textContent = "Edit"
    editBtn.onclick = () => {
        const newValue = prompt("Edit task:", itemValue)
        if (newValue !== null && newValue.trim() !== "") {
            const itemRef = ref(database, `toDoList/${itemID}`)
            set(itemRef, newValue)
        }
    }

    // Delete Button
    const deleteBtn = document.createElement("button")
    deleteBtn.textContent = "Delete"
    deleteBtn.onclick = () => {
        const itemRef = ref(database, `toDoList/${itemID}`)
        remove(itemRef)
    }

    // Complete Button
    const completeBtn = document.createElement("button")
    completeBtn.textContent = "Complete"
    completeBtn.onclick = () => {
        push(completedListInDB, itemValue)
        const itemRef = ref(database, `toDoList/${itemID}`)
        remove(itemRef)
    }

    // Style Buttons
    [editBtn, deleteBtn, completeBtn].forEach(btn => {
        btn.style.margin = "2px"
        btn.style.fontSize = "12px"
        btn.style.padding = "5px"
    })

    btnContainer.append(editBtn, deleteBtn, completeBtn)
    li.appendChild(btnContainer)
    toDoListEl.appendChild(li)
}

function appendItemToCompletedListEl([itemID, itemValue]) {
    const li = document.createElement("li")
    li.textContent = itemValue

    const restoreBtn = document.createElement("button")
    restoreBtn.textContent = "Restore"
    restoreBtn.onclick = () => {
        push(toDoListInDB, itemValue)
        const itemRef = ref(database, `completedList/${itemID}`)
        remove(itemRef)
    }

    // Style Restore Button
    restoreBtn.style.margin = "5px"
    restoreBtn.style.fontSize = "12px"
    restoreBtn.style.padding = "5px"

    li.appendChild(restoreBtn)
    completedListEl.appendChild(li)
}