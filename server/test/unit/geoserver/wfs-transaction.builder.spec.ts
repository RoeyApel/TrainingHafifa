import { describe, expect, it } from '@jest/globals';
import type { Polygon } from 'typeorm';
import {
  buildInsertTransaction,
  buildUpdateTransaction,
} from '../../../src/geoserver/wfs-transaction.builder.js';

const namespace = { prefix: 'imunim', uri: 'http://imunim' };

const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [672000, 3408000],
      [673000, 3408000],
      [673000, 3409000],
      [672000, 3408000],
    ],
  ],
};

describe('buildInsertTransaction', () => {
  it('qualifies the feature type and attributes with the workspace prefix', () => {
    const xml = buildInsertTransaction(namespace, 'force_deployment', {
      unit_name: 'גדוד 50',
      troops_count: 0,
      is_deleted: false,
    });

    expect(xml).toContain('xmlns:imunim="http://imunim"');
    expect(xml).toContain(
      '<wfs:Insert><imunim:force_deployment>' +
        '<imunim:unit_name>גדוד 50</imunim:unit_name>' +
        '<imunim:troops_count>0</imunim:troops_count>' +
        '<imunim:is_deleted>false</imunim:is_deleted>' +
        '</imunim:force_deployment></wfs:Insert>',
    );
  });

  it('escapes user input so it cannot break the document', () => {
    const xml = buildInsertTransaction(namespace, 'force_deployment', {
      unit_name: '</imunim:unit_name><x>"&\'',
    });

    expect(xml).toContain(
      '<imunim:unit_name>&lt;/imunim:unit_name&gt;&lt;x&gt;&quot;&amp;&apos;</imunim:unit_name>',
    );
  });

  it('omits undefined attributes', () => {
    const xml = buildInsertTransaction(namespace, 'force_deployment', {
      unit_name: 'a',
      commander_name: undefined,
    });

    expect(xml).not.toContain('commander_name');
  });

  it('omits null attributes instead of sending empty elements', () => {
    const xml = buildInsertTransaction(namespace, 'force_deployment', {
      unit_name: 'a',
      troops_count: null,
      commander_name: null,
    });

    expect(xml).not.toContain('troops_count');
    expect(xml).not.toContain('commander_name');
  });

  it('writes polygons as GML in EPSG:32636', () => {
    const xml = buildInsertTransaction(namespace, 'force_deployment', {
      geom: square,
    });

    expect(xml).toContain(
      '<imunim:geom><gml:Polygon srsName="EPSG:32636"><gml:exterior><gml:LinearRing>' +
        '<gml:posList>672000 3408000 673000 3408000 673000 3409000 672000 3408000</gml:posList>' +
        '</gml:LinearRing></gml:exterior></gml:Polygon></imunim:geom>',
    );
  });
});

describe('buildUpdateTransaction', () => {
  it('updates only the given attributes of one feature', () => {
    const xml = buildUpdateTransaction(
      namespace,
      'force_deployment',
      'force_deployment.7',
      { is_deleted: true, unit_name: undefined },
    );

    expect(xml).toContain(
      '<wfs:Update typeName="imunim:force_deployment">' +
        '<wfs:Property><wfs:Name>is_deleted</wfs:Name><wfs:Value>true</wfs:Value></wfs:Property>' +
        '<ogc:Filter><ogc:FeatureId fid="force_deployment.7"/></ogc:Filter>' +
        '</wfs:Update>',
    );
  });

  it('clears an attribute set to null by sending no value', () => {
    const xml = buildUpdateTransaction(
      namespace,
      'force_deployment',
      'force_deployment.7',
      { commander_name: null },
    );

    expect(xml).toContain(
      '<wfs:Property><wfs:Name>commander_name</wfs:Name></wfs:Property>',
    );
  });
});
