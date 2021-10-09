import { Activity } from './../models/Activity';
import { makeAutoObservable, runInAction } from "mobx";
import agent from '../api/agent';

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

    get groupedActivities() {
        return Object.entries(
            this.ActivitiesByDate.reduce((ac, a) => {
                const date = a.date;
                ac[date] = ac[date] ? [...ac[date], a] : [a]
                return ac
            }, {} as {[key: string]: Activity[]})
        )
    }

    loadActivities = async () => {
        try {
            const activities = await agent.Activities.list();
            activities.forEach((a: Activity) => {
                this.setActivity(a);
            })
            this.setLoadingInitial(false)
        } catch (err) {
            this.setLoadingInitial(false)
        }
    }

    loadActivity = async (id: string) => {
        let activity = this.activityRegistry.get(id);
        if (activity) {
            this.selectedActivity = activity;
            return activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                runInAction(() => {
                    this.selectedActivity = activity;
                })
                this.setLoadingInitial(false);
                return activity;
            } catch(err) {
                console.log(err);
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (a: Activity) => {
        a.date = a.date.split("T")[0];
        this.activityRegistry.set(a.id, a);
    }

    setLoadingInitial = (s: boolean) => {
        this.loadingInitial = s;
    }

    createActivity = async (a: Activity) => {
        this.loading = true;
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