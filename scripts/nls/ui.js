define({
    'root': {
        test: "This is test string!",
		page: {
            signIn: {
                email: "Email",
                psw: "Password",
                forgotPsw: "Forgot password",
                submit: "Sign In"
            },
            signUp: {
                email: "Email",
                psw: "Password",
                retypePsw: "Retype password",
                name: "First Name",
                surname: "Last Name",
                submit: "Sign Up"
            },
            dashboard: {
                msg: "Dashboard page coming soon"
            },
            tasks: {
                tab: {
                    allTasks: "All Tasks",
                    myTasks: "My Tasks"
                },
                addTab: {
                    title: "New Tab",
                    label: "Label",
                    filters: "Filters",
                    submit: "Add Tab"
                }
            },
            data: {
                msg: "Data page coming soon"
            },
            roles: {
                tab: {
                    systemRoles: {
                        this: "System Roles"
                    },
                    manageRoles: {
                        this: "Process Roles",
                        label: "Petri Net",
                        back: "Back",
                        save: "Save"
                    }
                }
            },
            workflow: {
                msg: "Workflow page coming soon",
                uploadNet: "Upload Net",
                createCase: "Create Case"
            },
            console: {
                title: "Invite User",
                email: "Email",
                submit: "Send Invite"
            },
            userProfile: {
                title: "Profile",
                msgPart1: "Your profile is",
                msgPart2: "complete",
                generalInfo: {
                    title: "General Information",
                    name: "First Name",
                    surname: "Last Name",
                    org: "Organization"
                },
                systemRoles: {
                    title: "System Roles"
                },
                workflowRoles: {
                    title: "Workflow Roles"
                },
                contactInfo: {
                    title: "Contact Information",
                    phone: "Phone Number",
                    email: "Email"
                },
                changePsw: "Change Password",
                submit: "Update"
            }
        },
        block: {
            mainNav: {
                dashboard: "Dashboard",
                tasks: "Tasks",
                data: "Data",
                roles: "Roles",
                workflow: "Workflow",
                console: "Admin Console"
            },
            mainMenu: {
                notifications: "Notifications",
                profile: "Profile",
                lang: {
                    this: "Language",
                    en: "English",
                    sk: "Slovak"
                },
                logout: "Logout"
            },
            taskFilter: {
                process: "Process",
                task: "Task",
                save: "Save",
                reset: "Reset"
            },
            taskHeader: {
                case: "Case",
                name: "Name",
                priority: "Priority",
                user: "User",
                startDate: "Start Date",
                status: "Status",
                view: {
                    this: "View",
                    list: "List",
                    table: "Table"
                }
            },
            task: {
                assign: "Assign",
                reassign: "Reassign",
                delegate: "Delegate",
                saveData: "Save Data",
                finish: "Finish",
                cancel: "Cancel",
                collapse: "Collapse",
                noDataMsg: "There is no data for this task",
                notFound: "was not found :(",
                priority: {
                    low: "Low",
                    medium: "Medium",
                    high: "High"
                }
            },
            dialog: {
                uploadNet: {
                    title: "Upload Net",
                    uploadBtn: "Choose a Net",
                    uploadHelp: "Requires XML file",
                    name: "Name",
                    maxchars: "Petri Net initials must be at most 3 characters long",
                    initials: "Initials",
                    submit: "Upload"
                },
                createCase: {
                    title: "Create Case",
                    petriNet: "Petri Net",
                    name: "Name",
                    color: "Label color",
                    submit: "Create"
                },
                saveFilter: {
                    title: "Save Filter",
                    name: "Name",
                    visibility: {
                        label: "Visibility",
                        global: "Global",
                        organization: "Organization",
                        private: "Private"
                    },
                    process: "Process",
                    task: "Task",
                    submit: "Save"
                }
            },
            bottomSheet: {
                user: "User",
                assign: "Assign"
            },
            fab: {
                tooltip: "Back to top"
            }
        }
    },
    'sk-sk':true
});