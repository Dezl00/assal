const fs = require('fs');
let c = fs.readFileSync('src/app/admin/settings/settings-client.tsx', 'utf8');

c = c.replace('<div className="flex-1 bg-card border border-border/50 rounded-xl shadow-sm min-h-[500px]">', '<div className="flex-1 min-w-0 bg-card border border-border/50 rounded-xl shadow-sm min-h-[500px]">');
c = c.replace('<h4 className="font-semibold text-sm">{backup.filename}</h4>', '<h4 className="font-semibold text-sm truncate" title={backup.filename}>{backup.filename}</h4>');
c = c.replace('<div className="text-xs text-muted-foreground mt-1 flex gap-4">', '<div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">');
c = c.replace('<div key={backup.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card">', '<div key={backup.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg bg-card gap-4">\\n                        <div className="min-w-0">');
// Since we added an extra <div> wrapper for the first div in the backup loop, we must close it.
c = c.replace('</div>\\n                        <div className="flex items-center gap-3">', '</div></div>\\n                        <div className="flex items-center gap-3 shrink-0">');

c = c.replace('<table className="w-full text-sm text-right">', '<div className="overflow-x-auto"><table className="w-full text-sm text-right min-w-[500px]">');
c = c.replace('</table>\\n                    </div>\\n                  )}', '</table></div>\\n                    </div>\\n                  )}');
c = c.replace('</table>\\r\\n                    </div>\\r\\n                  )}', '</table></div>\\r\\n                    </div>\\r\\n                  )}');

fs.writeFileSync('src/app/admin/settings/settings-client.tsx', c);
