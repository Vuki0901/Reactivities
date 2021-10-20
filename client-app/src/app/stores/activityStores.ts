import { Activity } from './../models/Activity';
import { makeAutoObservable, runInAction } from "mobx";
import agent from '../api/agent';
import { format } from 'date-fns';

export default class ActivityStore {
    activities: Activity[] = [];
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode: boolean = false;
    loading: boolean = false;
    loadingInitial: boolean = false;


    constructor() {
        makeAutoObservable(this);
    }

    get ActivitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) => 
            a.date!.getTime() - b.date!.getTime());
    }

    get groupedActivities() {
        return Object.entries(
            this.ActivitiesByDate.reduce((ac, a) => {
                const date = format(a.date!, "dd MMM yyyy");
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
        a.date = new Date(a.date!);
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