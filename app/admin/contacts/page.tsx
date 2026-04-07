"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { hasAdminSession } from "@/lib/admin-auth"
import { contactService, type ContactSubmission } from "@/lib/firebase-services"

const statusStyles: Record<ContactSubmission["status"], string> = {
  NEW: "bg-blue-100 text-blue-800",
  REVIEWED: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
}

const formatDate = (value: ContactSubmission["createdAt"] | ContactSubmission["updatedAt"]) => {
  if (!value) return "N/A"
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleString()
  }

  return new Date(value as unknown as string).toLocaleString()
}

const AdminContactsPage: React.FC = () => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, ContactSubmission["status"]>>({})
  const [updatingSubmissionId, setUpdatingSubmissionId] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAdminSession()) {
      router.replace("/admin")
      return
    }

    setAuthorized(true)
    const unsubscribe = contactService.subscribeToSubmissions((items) => {
      setSubmissions(items)
      setSelectedStatuses(
        Object.fromEntries(items.map((submission) => [submission.id, submission.status])) as Record<
          string,
          ContactSubmission["status"]
        >,
      )
      setLoading(false)
      setRefreshing(false)
    })

    return () => unsubscribe()
  }, [router])

  const stats = useMemo(
    () => ({
      total: submissions.length,
      newCount: submissions.filter((submission) => submission.status === "NEW").length,
      resolvedCount: submissions.filter((submission) => submission.status === "RESOLVED").length,
    }),
    [submissions],
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const items = await contactService.getAllSubmissions()
      setSubmissions(items)
      setSelectedStatuses(
        Object.fromEntries(items.map((submission) => [submission.id, submission.status])) as Record<
          string,
          ContactSubmission["status"]
        >,
      )
    } catch (error) {
      console.error("Error refreshing contact submissions:", error)
      toast.error("Failed to refresh contact submissions")
    } finally {
      setRefreshing(false)
    }
  }

  const handleStatusUpdate = async (submissionId: string) => {
    const nextStatus = selectedStatuses[submissionId]
    if (!nextStatus) return

    setUpdatingSubmissionId(submissionId)
    try {
      await contactService.updateSubmissionStatus(submissionId, nextStatus)
      toast.success("Contact status updated")
    } catch (error) {
      console.error("Error updating contact submission:", error)
      toast.error("Failed to update contact status")
    } finally {
      setUpdatingSubmissionId(null)
    }
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading contact submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-custom py-8 space-y-8">
        <AdminNavigation
          title="Vaibhav Resto Contacts"
          description="View every contact form message and track which ones are still pending."
          actions={
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>New Messages</CardDescription>
              <CardTitle className="text-3xl">{stats.newCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-3xl">{stats.resolvedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>Messages submitted from the website contact page.</CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No contact messages yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.name}</p>
                          <p className="text-xs text-muted-foreground">Updated {formatDate(submission.updatedAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{submission.email}</p>
                          <p className="text-sm text-muted-foreground">{submission.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-3 text-sm">{submission.message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[submission.status]}>{submission.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={selectedStatuses[submission.id]}
                            onValueChange={(value: ContactSubmission["status"]) =>
                              setSelectedStatuses((current) => ({ ...current, [submission.id]: value }))
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">NEW</SelectItem>
                              <SelectItem value="REVIEWED">REVIEWED</SelectItem>
                              <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(submission.id)}
                            disabled={updatingSubmissionId === submission.id}
                          >
                            {updatingSubmissionId === submission.id ? "Updating..." : "Update"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminContactsPage
