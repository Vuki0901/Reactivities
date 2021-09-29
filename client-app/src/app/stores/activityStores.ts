import { Activity } from './../models/Activity';
import { makeAutoObservable, runInAction } from "mobx";
import agent from '../api/agent';
import {v4 as uuid} from "uuid";

export default class ActivityStore {
    activities: Activity[] = [];
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode: boolean = false;
    loading: boolean = false;
    loadingInitial: boolean = true;


    constructor() {
        makeAutoObservable(this);
    }

    get ActivitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) => 
            Date.parse(a.date) - Date.parse(b.date))
    }

    loadActivities = async () => {
        try {
            const activities = await agent.Activities.list();
            activities.forEach((a: Activity) => {
                a.date = a.date.split("T")[0];
                this.activityRegistry.set(a.id, a);
            })
            this.setLoadingInitial(false)
        } catch (err) {
            this.setLoadingInitial(false)
        }
    }

    setLoadingInitial = (s: boolean) => {
        this.loadingInitial = s;
    }

    selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id);
    }

    cancelSelectActivity = () => {
        this.selectedActivity = undefined;
    }

    openForm = (id?: string) => {
        id ? this.selectActivity(id) : this.cancelSelectActivity();
        this.editMode = true;
    }

    closeForm = () => {
        this.editMode = false;
    }

    createActivity = async (a: Activity) => {
        this.loading = true;
        a.id = uuid();
        try {
            await agent.Activities.create(a);
            runInAction(() => {
                this.activityRegistry.set(a.id, a);
                this.selectedActivity = a;
                this.editMode = false;
                this.loading = false;
            })
        } catch (err) {
            console.log(err);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateActivity = async (a: Activity) => {
        this.loading = true;
        try {
            await agent.Activities.update(a);
            runInAction(() => {
                this.activityRegistry.set(a.id, a);
                this.selectedActivity = a;
                this.editMode = false;
                this.loading = false;
            })

        } catch(err) {
            console.log(err);
            runInAction(() => {
                this.loading = false;
            })
            
        }
    }

    deleteActivity = async (id: string) => {
        this.loading = true;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                if (this.selectedActivity?.id === id) this.cancelSelectActivity();
                this.loading = false;
            })

        } catch(err) {
            console.log(err);
            runInAction(() => {
                this.loading = false;
            })
        }
    }
    
}