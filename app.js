const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');





// DB Connection
const conn = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'employees_db'
})



// Check the connection
conn.connect(function (err) {
    if (err) throw err;
    entryPoint();
})

// console.log("no error");


// ENTRY POINT
function entryPoint() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What you want to do, Please choose from the below options.',
        choices: [
            'View All Employees',
            'Add an Employee',
            'View All Roles',
            'Add a Role',
            'View All Departments',
            'Add a Department',
            'View Employees by manager',
            'Update employee manager',
            'View Employees by department',
            'View departments budget',
            'Delete an employee',
            'Delete a role',
            'Delete a department',
            'EXIT'
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case 'View All Employees':
                viewEmployees();
                break;
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View Employees by manager':
                viewEmployeesByManager();
                break;
            case 'View Employees by department':
                viewEmployeesByDepartment();
                break;
            case 'View departments budget':
                viewDepartmentBudget();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Update employee manager':
                updateManager();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'EXIT':
                closeApp();
                break;
            default:
                break;
        }
    })
};



// All Employees
function viewEmployees() {
    // console.log("function called");
    let query = 'SELECT employee.id,employee.first_name,employee.last_name,role.title,department.name as department,role.salary,CONCAT(manager.first_name," ", manager.last_name) AS manager FROM employee LEFT JOIN employee AS manager ON employee.id=manager.manager_id LEFT JOIN roLe on employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id';
    conn.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        entryPoint();
    })
};




// ALL Departments
function viewDepartments() {
    let query = 'SELECT * FROM department';
    conn.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        entryPoint();
    })
};



// ALL Roles
function viewRoles() {
    let query = 'SELECT role.id,role.title,department.name as department,role.salary FROM role INNER JOIN department on role.department_id=department.id';
    conn.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        entryPoint();
    })
};



// Adding employee
function addEmployee() {
    conn.query('SELECT * FROM role', function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'first_name',
                type: 'input',
                message: "What is the employee's fist name? ",
            },
            {
                name: 'last_name',
                type: 'input',
                message: "What is the employee's last name? "
            },
            {
                name: 'manager_id',
                type: 'input',
                message: "What is the employee's manager's ID? "
            },
            {
                name: 'role',
                type: 'list',
                choices: function () {
                    let roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                },
                message: "What is this employee's role? "
            }
        ]).then(function (answer) {
            let role_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].title == answer.role) {
                    role_id = res[a].id;
                    console.log(role_id)
                }
            }
            conn.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    manager_id: answer.manager_id,
                    role_id: role_id,
                },
                function (err) {
                    if (err) throw err;
                    console.log('New employee has been added successfully');
                    viewEmployees();
                })
        })
    })
};





// Adding department


function addDepartment() {
    inquirer.prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'Which department would you like to add?'
        }
    ]).then(function (answer) {
        conn.query(
            'INSERT INTO department SET ?',
            {
                name: answer.newDepartment
            });
        let query = 'SELECT * FROM department';
        conn.query(query, function (err, res) {
            if (err) throw err;
            console.log('New department has been added successfully');
            console.table(res);
            viewDepartments();
        })
    })
};




// Adding role
function addRole() {
    conn.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'new_role',
                type: 'input',
                message: "What new role would you like to add?"
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this role? (Enter a number)'
            },
            {
                name: 'Department',
                type: 'list',
                choices: function () {
                    let deptArry = [];
                    for (let i = 0; i < res.length; i++) {
                        deptArry.push(res[i].name);
                    }
                    return deptArry;
                },
            }
        ]).then(function (answer) {
            let department_id;
            for (let a = 0; a < res.length; a++) {
                if (res[a].name == answer.Department) {
                    department_id = res[a].id;
                }
            }
            conn.query(
                'INSERT INTO role SET ?',
                {
                    title: answer.new_role,
                    salary: answer.salary,
                    department_id: department_id
                },
                function (err, res) {
                    if (err) throw err;
                    console.log('New role has been added successfully');
                    console.table(res);
                    viewRoles();
                })
        })
    })
};





//Employees by manager
function viewEmployeesByManager() {
    const sql = `SELECT employee.first_name,employee.last_name,role.title AS manager FROM employee LEFT JOIN role ON employee.manager_id = role.id`;
    conn.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        entryPoint();
    });
};



//Employees by department
function viewEmployeesByDepartment() {
    const sql = `SELECT employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id`;
    conn.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        entryPoint();
    });
};



//budget By Department
function viewDepartmentBudget() {
    console.log('Budget By Department:');
    const sql = `SELECT department.id AS id, department.name AS name, SUM(salary) AS budget FROM role INNER JOIN department ON role.id = department.id GROUP BY role.id`;
    conn.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        entryPoint();
    });
};




//Update employee manager
function updateManager() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the employee's ID you want to be updated",
            name: "updateManager"
        },
        {
            type: "input",
            message: "Enter the new Manager ID for that employee",
            name: "newManager"
        }
    ]).then(function (res) {
        const updateManager = res.updateManager;
        const newManager = res.newManager;
        const queryUpdate = `UPDATE employee SET manager_id = "${newManager}" WHERE id = "${updateManager}"`;
        conn.query(queryUpdate, function (err, res) {
            if (err) {
                throw err;
            }
            console.table(res);
            viewEmployees();
        })
    });
}




//Delete an employee in the DB
async function deleteEmployee() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the employee ID you want to remove:  "
        }
    ]);

    conn.query('DELETE FROM employee WHERE ?',
        {
            id: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Employee has been removed from the system successfully');
    viewEmployees();
};



//Delete a role in the DB
async function deleteRole() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the role ID you want to remove:  "
        }
    ]);

    conn.query('DELETE FROM role WHERE ?',
        {
            id: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Role has been removed from the system successfull');
    viewRoles();
};



//Delete a department in the DB
async function deleteDepartment() {
    const answer = await inquirer.prompt([
        {
            name: "first",
            type: "input",
            message: "Enter the department name you want to remove:  "
        }
    ]);

    conn.query('DELETE FROM department WHERE ?',
        {
            name: answer.first
        },
        function (err) {
            if (err) throw err;
        }
    )
    console.log('Department has been removed from the system successfully');
    viewDepartments();
};




// closeApp
function closeApp() {
    connection.end();
};