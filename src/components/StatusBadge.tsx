import { DonationStatus } from '../types';

export default function StatusBadge({ status }: { status: DonationStatus | string }) {
  let bgClass = "bg-gray-100 text-gray-700 border-gray-200";
  let label = status;

  switch (status) {
    case DonationStatus.AVAILABLE:
      bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "Available";
      break;
    case DonationStatus.REQUESTED:
      bgClass = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Requested";
      break;
    case DonationStatus.ACCEPTED:
      bgClass = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Request Accepted";
      break;
    case DonationStatus.PICKED_UP:
      bgClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Out for Pickup";
      break;
    case DonationStatus.COMPLETED:
      bgClass = "bg-green-100 text-green-800 border-green-300";
      label = "Distributed (Completed)";
      break;
    default:
      bgClass = "bg-gray-50 text-gray-700 border-gray-200";
  }

  return (
    <span 
      className={`px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase ${bgClass}`}
      id={`badge-${status.replace(/\s+/g, '-')}`}
    >
      {label}
    </span>
  );
}
