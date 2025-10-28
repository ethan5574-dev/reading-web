'use client';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function CKEditorClient({ value, onChange, placeholder }:{
  value: string; onChange: (v: string)=>void; placeholder?: string;
}) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_, editor) => onChange(editor.getData())}
      config={{
        placeholder,
        licenseKey: 'GPL',
        removePlugins: [
          'CKBox',
          'EasyImage',
          'RealTimeCollaborativeComments',
          'RealTimeCollaborativeTrackChanges',
          'RealTimeCollaborativeRevisionHistory',
          'PresenceList',
          'Comments',
          'TrackChanges',
          'RevisionHistory',
          'Pagination',
          'WProofreader',
          'SlashCommand',
          'Template',
        ],
      }}
    />
  );
}