"use client"

import { Bell, X, Check, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Notification } from "@/types"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "ALERT":
        return <Bell className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "URGENT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = () => {
    switch (notification.category) {
      case "PAYMENT":
        return "bg-green-100 text-green-800"
      case "COURSE":
        return "bg-blue-100 text-blue-800"
      case "STUDENT":
        return "bg-purple-100 text-purple-800"
      case "TEACHER":
        return "bg-indigo-100 text-indigo-800"
      case "SYSTEM":
        return "bg-gray-100 text-gray-800"
      case "SECURITY":
        return "bg-red-100 text-red-800"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={`transition-all duration-200 ${notification.isRead ? 'opacity-60' : 'shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getPriorityColor()}>
                  {notification.priority}
                </Badge>
                <Badge variant="outline" className={getCategoryColor()}>
                  {notification.category}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString('es-ES')}
              </span>
              
              <div className="flex items-center space-x-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 px-2"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(notification.id)}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {notification.actionUrl && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => window.location.href = notification.actionUrl}
              >
                Ver detalles →
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}