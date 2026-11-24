alter table public.client_requests
  add column negative_documents text[],
  add column negative_document_types text[],
  add constraint client_requests_negative_documents_check check (
    (negative_documents is null and negative_document_types is null)
    or (
      kind = 'negativa'
      and negative_documents is not null
      and negative_document_types is not null
      and cardinality(negative_documents) between 1 and 5
      and cardinality(negative_documents) = cardinality(negative_document_types)
    )
  );
