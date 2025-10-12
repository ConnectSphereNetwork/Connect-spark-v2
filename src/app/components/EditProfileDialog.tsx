"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Github, Linkedin } from "lucide-react";
import { putJson } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";

interface ProfileData {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  socialLinks: {
    linkedin?: string; github?: string; twitter?: string; portfolio?: string;
  };
}

const formSchema = z.object({
  fullName: z.string().max(50).optional(),
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
   skills: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  })
});

interface EditProfileDialogProps {
  profile: ProfileData;
  onProfileUpdate: (newProfile: Partial<ProfileData>) => void;
}

export default function EditProfileDialog({ profile, onProfileUpdate }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...profile,
      skills: profile.skills.join(', '),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await putJson<{ data: { user: ProfileData } }>('/api/profile/me', values);
      onProfileUpdate(res.data.user);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>Shape your digital identity within the Sphere. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] p-4 pr-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your name for connections" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="headline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline</FormLabel>
                      <FormControl><Input placeholder="e.g., Building my Sphere" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl><Textarea placeholder="Tell your connections about yourself..." className="resize-none" rows={4} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl><Input placeholder="e.g., React, Node.js, UI/UX" {...field} /></FormControl>
                    <FormDescription>Separate your skills with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Social Links</h3>
                  <div className="space-y-4">
                    <FormField control={form.control} name="socialLinks.github" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Github className="h-4 w-4 mr-2" /> GitHub</FormLabel>
                        <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="socialLinks.linkedin" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Linkedin className="h-4 w-4 mr-2" /> LinkedIn</FormLabel>
                        <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 mt-4 border-t">
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}