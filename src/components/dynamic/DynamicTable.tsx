import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Trash2, Search, RefreshCw, Layers, FileSpreadsheet } from 'lucide-react';

interface ColumnDef {
  key: string;
  label: string;
}

interface DynamicTableProps {
  title?: string;
  collection: string;
  columns?: ColumnDef[];
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  title = 'Data Overview',
  collection,
  columns = [],
}) => {
  const { previewData, fetchCollectionData, deleteRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    if (!collection) return;
    setLoading(true);
    await fetchCollectionData(collection);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  const records = previewData[collection] || [];

  // Filter records based on search
  const filteredRecords = records.filter((rec) => {
    if (!searchTerm) return true;
    return Object.values(rec).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record? This action is permanent.')) {
      await deleteRecord(collection, id);
    }
  };

  if (!collection) {
    return (
      <div className="p-4 border border-rose-500/30 rounded-xl bg-rose-500/5 text-rose-300 text-xs flex items-center space-x-2">
        <Layers className="w-4 h-4 text-rose-400" />
        <span>Failed rendering table: &quot;collection&quot; parameter is missing.</span>
      </div>
    );
  }

  // Resolve headers dynamically if not explicitly specified in the JSON config
  const finalColumns =
    columns.length > 0
      ? columns
      : records.length > 0
      ? Object.keys(records[0])
          .filter((k) => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt')
          .map((k) => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))
      : [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{title}</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono font-medium">
              /api/{collection}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Querying dynamic schema-agnostic records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all w-full sm:w-48"
            />
          </div>

          <button
            onClick={fetchRecords}
            disabled={loading}
            className="p-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reload records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-900/30 text-zinc-400 font-semibold tracking-wider border-b border-zinc-800">
              {finalColumns.map((col) => (
                <th key={col.key} className="p-4 font-medium uppercase text-[10px]">
                  {col.label}
                </th>
              ))}
              <th className="p-4 text-right font-medium uppercase text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {filteredRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={finalColumns.length + 1}
                  className="p-8 text-center text-zinc-500 font-medium"
                >
                  {loading ? 'Refreshing records...' : 'No records found matching this collection.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-900/25 transition-colors group"
                >
                  {finalColumns.map((col) => {
                    const cellVal = row[col.key];
                    let renderContent = '';

                    if (typeof cellVal === 'boolean') {
                      renderContent = cellVal ? 'Yes' : 'No';
                    } else if (cellVal !== undefined && cellVal !== null) {
                      renderContent = String(cellVal);
                    } else {
                      renderContent = '-';
                    }

                    return (
                      <td key={col.key} className="p-4 text-zinc-300 font-mono">
                        {col.key === 'email' ? (
                          <span className="text-indigo-400 hover:underline cursor-pointer">
                            {renderContent}
                          </span>
                        ) : typeof cellVal === 'boolean' ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              cellVal
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700/20'
                            }`}
                          >
                            {renderContent}
                          </span>
                        ) : (
                          renderContent
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-1.5 border border-zinc-800/80 bg-zinc-950/60 rounded-md text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Row count summary */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 text-[10px] text-zinc-500 font-medium flex items-center justify-between">
        <span>
          Showing {filteredRecords.length} of {records.length} item(s)
        </span>
        <span>PostgreSQL JSONB Storage</span>
      </div>
    </div>
  );
};

export default DynamicTable;
