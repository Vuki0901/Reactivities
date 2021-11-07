import { Profile } from './../models/Profile';
import { Activity, ActivityFormValues } from './../models/Activity';
import { makeAutoObservable, runInAction } from "mobx";
import agent from '../api/agent';
import { format } from 'date-fns';
import { store } from './store';

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
        const user = store.userStore.user;
        if (user) {
            a.isGoing = a.attendees!.some(
                a => a.username === user.username
            )
            a.isHost = a.hostUsername === user.username;
            a.host = a.attendees?.find(x => x.username === a.hostUsername);
        }
        a.date = new Date(a.date!);
        this.activityRegistry.set(a.id, a);
    }

    setLoadingInitial = (s: boolean) => {
        this.loadingInitial = s;
    }

    createActivity = async (a: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);
        try {
            await agent.Activities.create(a);
            const newActivity = new Activity(a);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];
            this.setActivity(newActivity);
            runInAction(() => {
                this.selectedActivity = newActivity;
            })
        } catch (err) {
            console.log(err);
        }
    }

    updateActivity = async (a: ActivityFormValues) => {
        try {
            await agent.Activities.update(a);
            runInAction(() => {
                if (a.id) {
                    let updatedActivity = {...this.activityRegistry.get(a.id), ...a}
                    this.activityRegistry.set(a.id, updatedActivity as Activity);
                    this.selectedActivity = updatedActivity as Activity;
                }
            })

        } catch(err) {
            console.log(err);
            
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

    updateAttendance = async () => {
        const user = store.userStore.user;
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                if (this.selectedActivity?.isGoing) {
                    this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(
                        a => a.username !== user?.username
                    )
                    this.selectedActivity.isGoing = false;
                } else {
                    const attendee = new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing = true;
                }
                this.activityRegistry.set(
                    this.selectedActivity!.id,
                    this.selectedActivity!
                )
            })
        } catch(err) {
            console.log(err);
        } finally {
            runInAction(() => this.loading = false);
        }
    }

    cancelActivityToggle = async () => {
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id)
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!)
            })

        } catch (err) {
            console.log(err);
            
        } finally {
            runInAction(() => this.loading = false);
        }
    }
    
}