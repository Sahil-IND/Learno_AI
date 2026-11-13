import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { apiConnector } from "../../../../services/apiConnector"

const HISTORY_API = `${process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"}/payment/history`

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR" }).format(amount)

const STATUS_STYLE = {
  paid: "bg-caribbeangreen-900 text-caribbeangreen-100",
  created: "bg-richblack-600 text-richblack-100",
  failed: "bg-pink-900 text-pink-100",
}

// The signed-in student's own payment records, newest first
export default function PaymentHistory() {
  const { token } = useSelector((state) => state.auth)
  const [payments, setPayments] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiConnector("GET", HISTORY_API)
      .then((response) => {
        if (cancelled) return
        if (!response.data.success) throw new Error(response.data.message)
        setPayments(response.data.data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <section
      aria-labelledby="payments-heading"
      className="my-10 flex flex-col gap-6 rounded-md border border-richblack-700 bg-richblack-800 p-8 px-12"
    >
      <div>
        <h2 id="payments-heading" className="text-lg font-semibold text-richblack-5">
          Payment history
        </h2>
        <p className="mt-1 text-sm text-richblack-300">Your course purchases and their status.</p>
      </div>

      {payments === null && !error && (
        <div className="grid place-items-center py-8">
          <div className="spinner" aria-label="Loading payment history"></div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-pink-100">
          We couldn't load your payment history. Please try again.
        </p>
      )}

      {payments !== null && payments.length === 0 && (
        <p className="text-sm text-richblack-300">No payments yet.</p>
      )}

      {payments !== null && payments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-richblack-100">
            <thead className="border-b border-richblack-600 text-xs uppercase tracking-wider text-richblack-400">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Date</th>
                <th scope="col" className="py-2 pr-4 font-medium">Course</th>
                <th scope="col" className="py-2 pr-4 font-medium">Amount</th>
                <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                <th scope="col" className="py-2 font-medium">Order</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-richblack-700 last:border-0">
                  <td className="py-3 pr-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                  <td className="py-3 pr-4">{payment.courses.join(", ") || "—"}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatAmount(payment.amount, payment.currency)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[payment.status] || STATUS_STYLE.created}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs text-richblack-300">{payment.orderId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
